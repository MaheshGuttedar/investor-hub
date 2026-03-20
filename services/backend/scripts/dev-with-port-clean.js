const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { spawn } = require('child_process');
const killPort = require('kill-port');

const port = Number(process.env.PORT || 4000);

async function run() {
  try {
    await killPort(port, 'tcp');
    console.log(`[dev] Freed port ${port}`);
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    if (/No process running/i.test(message) || /Could not kill process/i.test(message)) {
      console.log(`[dev] Port ${port} was already free`);
    } else {
      console.warn(`[dev] Could not free port ${port}: ${message}`);
    }
  }

  const cwd = path.join(__dirname, '..');
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', 'npx nodemon --watch src --exec "node src/index.js"'], {
        cwd,
        stdio: 'inherit',
      })
    : spawn('sh', ['-c', "npx nodemon --watch src --exec 'node src/index.js'"], {
        cwd,
        stdio: 'inherit',
      });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

run();
