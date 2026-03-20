const path = require('path');
const { spawn } = require('child_process');
const killPort = require('kill-port');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'services', 'backend');
const portsToFree = [8080, 4003]; // 2525 removed — fake SMTP not used (AWS SES)

function startNamedProcess(name, cwd, command) {
  const child = spawn(command, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  const prefix = `[${name}]`;

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`${prefix} ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`${prefix} ${chunk}`);
  });

  child.on('error', (err) => {
    process.stderr.write(`${prefix} failed to start: ${err.message}\n`);
  });

  return child;
}

async function freePorts() {
  for (const port of portsToFree) {
    try {
      await killPort(port, 'tcp');
      console.log(`[dev:all] Freed port ${port}`);
    } catch (err) {
      const message = String(err && err.message ? err.message : err);
      if (/No process running|Could not kill process/i.test(message)) {
        console.log(`[dev:all] Port ${port} already free`);
      } else {
        console.warn(`[dev:all] Could not free port ${port}: ${message}`);
      }
    }
  }
}

async function run() {
  await freePorts();

  const processes = [
   // startNamedProcess('smtp', backendDir, 'npm run smtp:fake'),
    startNamedProcess('backend', backendDir, 'npm run dev'),
    startNamedProcess('frontend', rootDir, 'npm run dev'),
  ];

  let exiting = false;

  const shutdown = (code = 0) => {
    if (exiting) return;
    exiting = true;

    for (const proc of processes) {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    }

    setTimeout(() => process.exit(code), 200);
  };

  processes.forEach((proc, index) => {
    proc.on('exit', (code) => {
      if (!exiting) {
        const name = [ 'backend', 'frontend'][index];
        console.error(`[dev:all] ${name} exited with code ${code ?? 0}`);
        shutdown(code ?? 0);
      }
    });
  });

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

run().catch((err) => {
  console.error(`[dev:all] startup failed: ${err.message}`);
  process.exit(1);
});
