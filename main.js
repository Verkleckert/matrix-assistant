const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ignoredNode  = /node_modules|[/\\]\./;
const config  = /config.json|[/\\]\./;

if (process.env.NODE_ENV !== 'production'){
  require('electron-reload')(__dirname, {ignored: [ignoredNode, config] })
}

let recorder;
let audioStream;

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

function readSetting(key) {
  settingsData = readSettings();

  settingsData.parse();

  return settingsData[key]
}

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