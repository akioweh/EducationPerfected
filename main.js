const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const credsFile = path.join(app.getPath('userData'), 'creds.json');

function createWindow() {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.maximize();
  win.show();
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('load-creds', () => {
  if (fs.existsSync(credsFile)) {
    return JSON.parse(fs.readFileSync(credsFile));
  }
  return {};
});

ipcMain.on('save-creds', (event, creds) => {
  fs.writeFileSync(credsFile, JSON.stringify(creds));
});

ipcMain.on('start-script', (event, creds) => {
  const nodeExecutable = path.join(__dirname, 'node_modules', 'node', 'bin', 'node.exe');
  const scriptPath = path.join(__dirname, 'puppeteer-script.js');

  const subprocess = spawn(nodeExecutable, [scriptPath, creds.username, creds.password], {
    detached: true,
    stdio: 'ignore'
  });

  subprocess.unref();

  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

ipcMain.on('delete-creds', () => {
  if (fs.existsSync(credsFile)) {
    fs.unlinkSync(credsFile);
  }
});
