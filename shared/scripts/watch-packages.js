// This file is called through "npm run watch" and uses typescript to watch if any of the shared packages changes. If so, Typescript rebuilds it.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const packagesDir = path.resolve(__dirname, '..', 'packages');
const pkgs = fs.readdirSync(packagesDir).filter(name => {
  const pkgJson = path.join(packagesDir, name, 'package.json');
  return fs.existsSync(pkgJson);
});

const procs = [];

pkgs.forEach(name => {
  const pkgPath = path.join(packagesDir, name);
  console.log('Starting watch for', name);
  const p = spawn('npx', ['tsc', '--watch'], {
    stdio: 'inherit',
    cwd: pkgPath,
    shell: true
  });
  procs.push(p);
});

function shutdown() {
  procs.forEach(p => p.kill());
  process.exit();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
