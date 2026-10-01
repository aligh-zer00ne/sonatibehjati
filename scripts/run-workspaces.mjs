import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const task = process.argv[2];
if (!['typecheck', 'build'].includes(task)) throw new Error('Unsupported workspace task');
for (const root of ['apps', 'packages']) {
  for (const name of readdirSync(root)) {
    const directory = `${root}/${name}`;
    const workspace = JSON.parse(readFileSync(`${directory}/package.json`, 'utf8'));
    if (!workspace.scripts?.[task]) continue;
    const result = spawnSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', task, '--workspace', workspace.name],
      { stdio: 'inherit', shell: process.platform === 'win32' },
    );
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
