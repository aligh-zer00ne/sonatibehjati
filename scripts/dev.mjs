import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { createConnection } from 'node:net';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { developmentEnvironment } from './dev-ports.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiEnv = parse(await readFile(join(root, 'apps/api/.env')));
const databaseUrl = process.env.DATABASE_URL ?? apiEnv.DATABASE_URL;
const url = new URL(databaseUrl);
const mysqlPort = process.env.DEV_MYSQL_PORT ?? apiEnv.DEV_MYSQL_PORT;
const managed =
  url.protocol === 'mysql:' &&
  ['localhost', '127.0.0.1'].includes(url.hostname) &&
  url.port === (mysqlPort ?? '3307') &&
  (mysqlPort !== undefined || (url.username === 'root' && !url.password)) &&
  url.pathname === '/behjati';
if ((process.env.NODE_ENV ?? apiEnv.NODE_ENV ?? 'development') !== 'development') {
  throw new Error('npm run dev requires development mode.');
}
// Ubuntu's MySQL AppArmor profile permits the user's ~/tmp directory.
// Unlike /tmp, this directory persists across reboots.
const state = join(homedir(), 'tmp/sonatibehjati-dev-mysql');
const data = join(state, 'data');
const mysqld = process.env.DEV_MYSQLD_BIN ?? apiEnv.DEV_MYSQLD_BIN ?? 'mysqld';
const mysqlEnv = {
  ...process.env,
  MYSQL_PWD: process.env.DEV_MYSQL_ROOT_PASSWORD ?? apiEnv.DEV_MYSQL_ROOT_PASSWORD ?? '',
};
let mysqlServer;
let applications;
let stopping = false;
let cleanup;

function stop() {
  if (cleanup) return cleanup;
  stopping = true;
  applications?.kill('SIGTERM');
  cleanup = (async () => {
    // MySQL handles SIGTERM as a graceful shutdown; only stop the child we started.
    if (mysqlServer && mysqlServer.exitCode === null) mysqlServer.kill('SIGTERM');
  })();
  return cleanup;
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());

function run(command, args, options = {}) {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit', ...options });
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} failed (${signal ?? code}).`));
    });
  });
}

function listening() {
  return new Promise((resolve) => {
    const socket = createConnection({
      host: managed ? '127.0.0.1' : url.hostname,
      port: Number(url.port || 3306),
    });
    const finish = (ready) => {
      socket.destroy();
      resolve(ready);
    };
    socket.setTimeout(1000);
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
  });
}

async function restore(fresh) {
  const folders = (
    await readdir(join(root, '.deployment')).catch((error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    })
  )
    .sort()
    .reverse();
  const backup = folders
    .map((folder) => join(root, '.deployment', folder, 'current-data.sql.gz'))
    .find((file) => existsSync(file));
  if (!backup && !fresh)
    throw new Error('No local backup found. Existing data will not be replaced with seed data.');
  if (backup) console.info('Restoring local database backup:', backup);
  const args = [
    '--no-defaults',
    '--host=127.0.0.1',
    `--port=${url.port}`,
    '--user=root',
    '--default-character-set=utf8mb4',
  ];
  await run('mysql', [...args, '-e', 'CREATE DATABASE behjati CHARACTER SET utf8mb4'], {
    env: mysqlEnv,
  });
  if (!backup) {
    console.info('Created an empty database for this fresh installation. No sample data seeded.');
    return;
  }
  const child = spawn('mysql', [...args, 'behjati'], {
    cwd: root,
    env: mysqlEnv,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  const completed = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error('Database restore failed.')),
    );
  });
  await Promise.all([pipeline(createReadStream(backup), createGunzip(), child.stdin), completed]);
  console.info('Local database restored. Existing databases are never reseeded.');
}

try {
  const development = await developmentEnvironment(process.env);
  for (const [name, port] of Object.entries(development.ports))
    console.info(
      `Development ${name}: http://localhost:${port}${name === 'admin' ? '/admin' : name === 'api' ? '/graphql' : ''}`,
    );
  let fresh = false;
  if (!(await listening())) {
    if (!managed)
      throw new Error(
        'Configured MySQL is unavailable. For a dedicated local instance, configure DEV_MYSQL_PORT to match DATABASE_URL.',
      );
    await mkdir(state, { recursive: true, mode: 0o700 });
    if (!existsSync(join(data, 'mysql'))) {
      fresh = true;
      console.info('Initializing persistent development MySQL.');
      await run(mysqld, ['--no-defaults', '--initialize-insecure', `--datadir=${data}`]);
    }
    console.info(`Starting persistent development MySQL on 127.0.0.1:${url.port}.`);
    mysqlServer = spawn(
      mysqld,
      [
        '--no-defaults',
        `--datadir=${data}`,
        `--socket=${state}/mysql.sock`,
        `--port=${url.port}`,
        '--bind-address=127.0.0.1',
        '--mysqlx=OFF',
        `--pid-file=${state}/mysql.pid`,
        `--log-error=${state}/mysql.log`,
      ],
      { cwd: root, stdio: 'inherit' },
    );
    let startupError;
    mysqlServer.once('error', (error) => {
      startupError = error;
    });
    for (let attempt = 0; attempt < 100 && !(await listening()); attempt++) {
      if (startupError || mysqlServer.exitCode !== null || stopping) break;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (startupError) throw startupError;
    if (!(await listening())) throw new Error(`MySQL did not start; inspect ${state}/mysql.log`);
  }
  if (managed) {
    // Never migrate an unrelated MySQL server which occupies our configured port.
    const { stdout } = await promisify(execFile)(
      'mysql',
      [
        '--no-defaults',
        '--host=127.0.0.1',
        `--port=${url.port}`,
        '--user=root',
        '--batch',
        '--skip-column-names',
        '-e',
        'SELECT @@datadir',
      ],
      { env: mysqlEnv },
    );
    if (resolve(stdout.trim()) !== resolve(data))
      throw new Error(
        'Configured MySQL port belongs to another instance. Choose a free DEV_MYSQL_PORT and update local DATABASE_URL.',
      );
    // Restore only if this managed instance has no project database; never overwrite it.
    if (!existsSync(join(data, 'behjati'))) await restore(fresh);
  }
  if (stopping) process.exitCode = 130;
  else {
    // Apply migrations automatically only to the narrowly scoped, local managed instance.
    if (managed)
      await run('npm', ['run', 'db:migrate'], {
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    const require = createRequire(import.meta.url);
    const concurrently = join(
      dirname(require.resolve('concurrently/package.json')),
      'dist/bin/concurrently.js',
    );
    applications = spawn(
      process.execPath,
      [
        concurrently,
        '-k',
        '-n',
        'storefront,api,admin',
        `npm run dev -w @behjati/storefront -- --port ${development.ports.storefront}`,
        'npm run dev -w @behjati/api',
        `npm run dev -w @behjati/admin -- --port ${development.ports.admin} --strictPort`,
      ],
      { cwd: root, stdio: 'inherit', env: development.env },
    );
    await new Promise((resolve, reject) => {
      applications.once('error', reject);
      applications.once('exit', (code) => {
        process.exitCode = stopping ? 0 : (code ?? 1);
        resolve();
      });
    });
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await stop();
}
