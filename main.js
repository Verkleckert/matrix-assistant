const { app, BrowserWindow, ipcMain } = require('electron');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');

const ignoredNode  = /node_modules|[/\\]\./;
const config  = /config.json|[/\\]\./;

if (process.env.NODE_ENV !== 'production'){
  require('electron-reload')(__dirname, {ignored: [ignoredNode, config] })
}

let recorder;
let audioStream;

ipcMain.on('stopRecording', () => {
  if (recorder) {
    recorder.stop();
    audioStream.getTracks().forEach((track) => track.stop());
  }
});

ipcMain.on('startRecording', (event, deviceId) => {
  navigator.mediaDevices
    .getUserMedia({ audio: { deviceId: deviceId ? { exact: deviceId } : undefined } })
    .then((stream) => {
      audioStream = stream;
      recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const filePath = 'recordedAudio.wav';

        fs.writeFile(filePath, Buffer.from(blob), (err) => {
          if (err) throw err;
          console.log('Audio saved successfully!');
        });
      };

      recorder.start();
    })
    .catch((err) => console.error(err));
});

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile('./src/index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    app.quit();
  });
});

ipcMain.on('saveSetting', (event, key, value) => {
  const configPath = './config.json';

  try {
    let existingSettings = readSettings();

    if (!existingSettings) {
      // Handle the case where the settings file is empty or not found
      existingSettings = {};
    }

    existingSettings[key] = value;

    writeData = JSON.stringify(existingSettings, null, 2);

    console.log(writeData)

    fs.writeFileSync(configPath, writeData);

  } catch (error) {
    console.error('Error saving setting:', error.message);
  }
});

ipcMain.on('readSetting', (event, key) => {
  const configPath = './config.json';
  generateFile(configPath);

  try {
    const data = fs.readFileSync(configPath, 'utf-8');

    const settings = JSON.parse(data);

    return settings[key];
  } catch (error) {
    console.error('Error reading setting:', error.message);
    return null;
  }
})

function readSettings() {
  const configPath = './config.json';
  generateFile(configPath);

  try {
    const data = fs.readFileSync(configPath, 'utf-8');

    return JSON.parse(data);

  } catch (error) {
    // Handle the case where the settings file is empty or not found
    console.error('Error reading settings:', error.message);
    return null;
  }
}

function fileExists(filePath) {
  try {
    // Check if the file exists
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    // File doesn't exist
    return false;
  }
}

// Function to generate a file if it doesn't exist
function generateFile(filePath) {
  if (!fileExists(filePath)) {
    try {
      // Write content to the file
      fs.writeFileSync(filePath, "{}", 'utf-8');
      console.log(`Config generated!`);
    } catch (error) {
      console.error('Error generating file:', error.message);
    }
  }
}