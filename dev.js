import { spawn } from 'node:child_process';

const useShell = process.platform === 'win32';
const servers = [
  spawn('npm', ['run', 'dev', '--prefix', 'server'], { stdio: 'inherit', shell: useShell }),
  spawn('npm', ['run', 'dev', '--prefix', 'client'], { stdio: 'inherit', shell: useShell })
];

function stop() {
  for (const server of servers) server.kill('SIGINT');
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
