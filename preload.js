const { ipcRenderer, desktopCapturer } = require('electron');
window.ipcRenderer = ipcRenderer;
window.desktopCapturer = desktopCapturer;

console.log('Preload script executed pre DOM-Loaded');

window.addEventListener('DOMContentLoaded', () => {
  
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  console.log('Preload script executed past DOM-Loaded');
})

ipcRenderer.on('error', (event, error) => {
  console.error('IPC Error:', error);
});