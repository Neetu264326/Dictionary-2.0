import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

const targets = [
  { name: 'server', cwd: path.join(root, 'server'), args: ['run', 'dev'] },
  { name: 'client', cwd: path.join(root, 'client'), args: ['run', 'dev'] },
];

const children = [];
let shuttingDown = false;

function log(name, chunk, isError = false) {
  const text = chunk.toString();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const prefix = isError ? `\x1b[31m[${name}]\x1b[0m` : `\x1b[36m[${name}]\x1b[0m`;
    (isError ? process.stderr : process.stdout).write(`${prefix} ${line}\n`);
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill(isWindows ? 'SIGTERM' : 'SIGTERM');
  }
  setTimeout(() => process.exit(code), 300);
}

for (const target of targets) {
  const child = spawn(npm, target.args, {
    cwd: target.cwd,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWindows,
  });

  child.stdout.on('data', (data) => log(target.name, data));
  child.stderr.on('data', (data) => log(target.name, data, true));
  child.on('exit', (code) => {
    if (!shuttingDown) {
      process.stdout.write(`\x1b[33m[${target.name}] exited with code ${code}\x1b[0m\n`);
      shutdown(code || 0);
    }
  });

  children.push(child);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
