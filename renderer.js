const { exec } = require('child_process');
const log = document.getElementById('log');

document.getElementById('start').onclick = () => {
  log.textContent = "Running script...";

  exec('node puppeteer-script.js', (err, stdout, stderr) => {
    if (err) {
      log.textContent = `Error:\n${stderr}`;
    } else {
      log.textContent = `Output:\n${stdout}`;
    }
  });
};
