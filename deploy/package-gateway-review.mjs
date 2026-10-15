import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function git(args) {
  return new Promise((resolve, reject) => {
    const p = spawn('git', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let errors = '';
    p.stdout.on('data', (chunk) => (output += chunk));
    p.stderr.on('data', (chunk) => (errors += chunk));
    p.on('error', reject);
    p.on('exit', (code) =>
      code === 0 ? resolve(output.trim()) : reject(new Error(errors || 'Git command failed.')),
    );
  });
}
await git(['diff', '--quiet']);
await git(['diff', '--cached', '--quiet']);
if ((await git(['branch', '--show-current'])) !== 'dev')
  throw new Error('Package the committed dev branch.');
const head = await git(['rev-parse', 'dev']);
const base = await git(['rev-parse', 'origin/dev']);
await git(['merge-base', '--is-ancestor', base, head]);
if (base === head) throw new Error('There are no local release commits to package.');
const path = resolve('.deployment/releases/gateway-review-' + head.slice(0, 7));
await mkdir(path, { recursive: true });
await git(['bundle', 'create', path + '/gateway-review.bundle', base + '..dev']);
await git(['bundle', 'verify', path + '/gateway-review.bundle']);
await copyFile('deploy/install-gateway-review.sh', path + '/install.sh');
await copyFile('docs/gateway-review-deploy.md', path + '/README.md');
const sha = createHash('sha256')
  .update(await readFile(path + '/gateway-review.bundle'))
  .digest('hex');
await writeFile(path + '/SHA256SUMS', sha + '  gateway-review.bundle\n');
await writeFile(
  path + '/release.json',
  JSON.stringify(
    {
      commit: head,
      prerequisite: base,
      branch: 'dev',
      profile: 'owner-only-live-gateway-review',
      customerAuthentication: false,
      smsRequired: false,
      amountToman: 10000,
      automaticReverse: true,
    },
    null,
    2,
  ) + '\n',
);
console.log('Gateway review release prepared at ' + path);
console.log('Bundle SHA-256: ' + sha);

await new Promise((resolve, reject) => {
  const p = spawn(
    'zip',
    [
      '-q',
      'gateway-review.zip',
      'gateway-review.bundle',
      'install.sh',
      'README.md',
      'SHA256SUMS',
      'release.json',
    ],
    { cwd: path, stdio: 'inherit' },
  );
  p.on('error', reject);
  p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ZIP packaging failed.'))));
});
console.log('Downloadable ZIP: ' + path + '/gateway-review.zip');
