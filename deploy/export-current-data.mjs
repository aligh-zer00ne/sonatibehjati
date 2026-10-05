import { readFileSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { parse } from 'dotenv';
const root = fileURLToPath(new URL('../', import.meta.url));
const envText = readFileSync(join(root, 'apps/api/.env'), 'utf8');
const env = parse(envText);
const url = new URL(env.DATABASE_URL);
if (url.protocol !== 'mysql:') throw new Error('A MySQL source is required.');
const folder = join(root, '.deployment', new Date().toISOString().replaceAll(':', '-'));
mkdirSync(folder, { recursive: true, mode: 0o700 });
chmodSync(join(root, '.deployment'), 0o700);
chmodSync(folder, 0o700);
const quote = (value) => JSON.stringify(value);
const cnf = join(folder, 'mysql-client.cnf');
writeFileSync(
  cnf,
  `[client]\nprotocol=tcp\nhost=${quote(url.hostname)}\nport=${url.port || '3306'}\nuser=${quote(decodeURIComponent(url.username))}\npassword=${quote(decodeURIComponent(url.password))}\n`,
  { mode: 0o600 },
);
const streamCommand = async (program, args, output) => {
  const child = spawn(program, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  // Raw client errors can contain account names: report the program and status only.
  child.stderr.resume();
  const exited = new Promise((resolve, reject) => {
    child.once('error', () => reject(new Error(`${program} could not start.`)));
    child.once('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${program} failed (${code}).`)),
    );
  });
  await Promise.all([
    pipeline(child.stdout, createGzip(), createWriteStream(output, { flags: 'wx', mode: 0o600 })),
    exited,
  ]);
};
try {
  await streamCommand(
    'mysqldump',
    [
      `--defaults-extra-file=${cnf}`,
      '--single-transaction',
      '--quick',
      '--no-tablespaces',
      '--set-gtid-purged=OFF',
      '--hex-blob',
      decodeURIComponent(url.pathname.slice(1)),
    ],
    join(folder, 'current-data.sql.gz'),
  );
  await streamCommand(
    'git',
    ['archive', '--format=tar', 'HEAD'],
    join(folder, 'current-source.tar.gz'),
  );
  const counts = JSON.parse(
    execFileSync(process.execPath, ['deploy/verify-current-data.mjs'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  );
  writeFileSync(join(folder, 'counts.json'), JSON.stringify(counts, null, 2) + '\n', {
    mode: 0o600,
  });
  writeFileSync(join(folder, 'api.env'), envText, { mode: 0o600 });
  console.log(
    `Private transfer files saved in ${folder}. No secrets or database records were printed.`,
  );
} catch {
  rmSync(folder, { recursive: true, force: true });
  throw new Error(
    'Export failed; incomplete private transfer files were removed. Check MySQL connectivity and git.',
  );
} finally {
  rmSync(cnf, { force: true });
}
