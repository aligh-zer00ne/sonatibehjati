import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const apiEnv = parse(await readFile(join(root, 'apps/api/.env')));
const databaseUrl = process.env.DATABASE_URL ?? apiEnv.DATABASE_URL;
const url = new URL(databaseUrl);
const managed =
  url.protocol === 'mysql:' &&
  ['localhost', '127.0.0.1'].includes(url.hostname) &&
  url.port === '3307' &&
  url.username === 'root' &&
  !url.password &&
  url.pathname === '/behjati';
if ((process.env.NODE_ENV ?? apiEnv.NODE_ENV ?? 'development') !== 'development') {
  throw new Error('npm run dev requires development mode.');
}
// Ubuntu's MySQL AppArmor profile permits the user's ~/tmp directory.
// Unlike /tmp, this directory persists across reboots.
const state = join(homedir(), 'tmp/sonatibehjati-dev-mysql');
const data = join(state, 'data');
let mysqlServer;
let applications;
let stopping = false;
let cleanup;

function stop() {
  if (cleanup) return cleanup;
  stopping = true;
  applications?.kill('SIGTERM');
  cleanup = (async () => {
    if (mysqlServer && mysqlServer.exitCode === null) {
      try {
        await run('mysqladmin', [
          '--no-defaults',
          `--socket=${state}/mysql.sock`,
          '--user=root',
          'shutdown',
        ]);
      } catch {
        mysqlServer.kill('SIGTERM');
      }
    }
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

async function restore() {
  const folders = (await readdir(join(root, '.deployment'))).sort().reverse();
  const backup = folders
    .map((folder) => join(root, '.deployment', folder, 'current-data.sql.gz'))
    .find((file) => existsSync(file));
  if (!backup)
    throw new Error('No local backup found. Existing data will not be replaced with seed data.');
  console.info('Restoring local database backup:', backup);
  const args = [
    '--no-defaults',
    '--host=127.0.0.1',
    '--port=3307',
    '--user=root',
    '--default-character-set=utf8mb4',
  ];
  await run('mysql', [...args, '-e', 'CREATE DATABASE behjati CHARACTER SET utf8mb4']);
  const child = spawn('mysql', [...args, 'behjati'], {
    cwd: root,
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
  if (!(await listening())) {
    if (!managed)
      throw new Error(
        'Configured MySQL is unavailable. Automatic startup only manages local development port 3307.',
      );
    await mkdir(state, { recursive: true, mode: 0o700 });
    if (!existsSync(join(data, 'mysql'))) {
      console.info('Initializing persistent development MySQL.');
      await run('mysqld', ['--no-defaults', '--initialize-insecure', `--datadir=${data}`]);
    }
    console.info('Starting persistent development MySQL on 127.0.0.1:3307.');
    mysqlServer = spawn(
      'mysqld',
      [
        '--no-defaults',
        `--datadir=${data}`,
        `--socket=${state}/mysql.sock`,
        '--port=3307',
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
    // Restore only if this managed instance has no project database; never overwrite it.
    if (!existsSync(join(data, 'behjati'))) await restore();
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
        'npm run dev:storefront',
        'npm run dev:api',
        'npm run dev:admin',
      ],
      { cwd: root, stdio: 'inherit' },
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
