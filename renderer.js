const { ipcRenderer } = require('electron');

window.onload = async () => {
  const saved = await ipcRenderer.invoke('load-creds');
  if (saved.username) document.getElementById('username').value = saved.username;
  if (saved.password) document.getElementById('password').value = saved.password;
};

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  document.getElementById('status').textContent = 'Running...';

  ipcRenderer.send('save-creds', { username, password });
  ipcRenderer.send('start-script', { username, password });
});

document.getElementById('deleteCreds').addEventListener('click', () => {
  ipcRenderer.send('delete-creds');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
});