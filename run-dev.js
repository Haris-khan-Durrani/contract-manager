/**
 * run-dev.js — Concurrent Full-Stack Development Runner
 * Starts both backend API (port 3001) and frontend Vite server (port 5173) simultaneously.
 */
const { spawn } = require('child_process');

console.log('─────────────────────────────────────────────────────────────');
console.log('🚀 Starting Contract Manager Full-Stack Application');
console.log('   • Backend API:  http://localhost:3001');
console.log('   • Frontend UI:  http://localhost:5173');
console.log('─────────────────────────────────────────────────────────────\n');

const server = spawn('npm', ['--prefix', 'server', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const client = spawn('npm', ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

let isShuttingDown = false;
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n🛑 Stopping servers…');

  if (process.platform === 'win32') {
    if (server.pid) spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { shell: true });
    if (client.pid) spawn('taskkill', ['/pid', client.pid, '/f', '/t'], { shell: true });
  } else {
    server.kill('SIGTERM');
    client.kill('SIGTERM');
  }
  process.exit();
}

server.on('close', (code) => {
  if (!isShuttingDown && code !== 0) {
    console.error(`[Server] Exited with code ${code}`);
  }
});

client.on('close', (code) => {
  if (!isShuttingDown && code !== 0) {
    console.error(`[Client] Exited with code ${code}`);
  }
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
