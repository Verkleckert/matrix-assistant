const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const { writeFile } = require('fs');
const path = require('path');

require('electron-reload')(__dirname);

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

        writeFile(filePath, Buffer.from(blob), (err) => {
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
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadFile('./src/index.html');

  mainWindow.window.ipcMain = ipcMain;


  mainWindow.on('closed', () => {
    app.quit();
  });
});


ipcMain.on('saveSetting', (event, key, value) => {
  const configPath = path.join(app.getPath('userData'), 'config.json');

  try {
    // Read existing settings or initialize an empty object
    const existingSettings = readSettings();

    // Update the specific setting
    existingSettings[key] = value;

    // Write updated settings to the config file
    fs.writeFileSync(configPath, JSON.stringify(existingSettings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving setting:', error.message);
  }
})

ipcMain.on('readSetting', (event, key) => {
  const configPath = path.join(app.getPath('userData'), 'config.json');

  try {
    // Read the content of the config file
    const data = fs.readFileSync(configPath, 'utf-8');

    // Parse the JSON data
    const settings = JSON.parse(data);

    // Return the specific setting
    return settings[key];
  } catch (error) {
    // If the file doesn't exist or there's an error, return null
    console.error('Error reading setting:', error.message);
    return null;
  }
})