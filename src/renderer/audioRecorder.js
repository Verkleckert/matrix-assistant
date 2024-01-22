// Fetch audio sources using desktopCapturer
async function getAudioSources() {
  try {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind === 'audioinput') {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label;
            const audioDevicesSelect = document.getElementById('audioDevices');
            audioDevicesSelect.add(option);
          }
        });
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  } catch (error) {
    console.error('Error enumerating audio devices:', error);
  }
}

// Listen for a message from the main process to set the chosen device
ipcRenderer.on('set-audio-device', (event, deviceInfo) => {
  try {
    // Ensure micInstance is properly disposed before creating a new one
    if (micInstance) {
      micInstance.removeAllListeners();  // Remove any existing listeners
      micInstance.stopRecording();
      micInstance = null;
    }

    // Create a new microphone instance with the chosen device
    micInstance = new (require('node-microphone'))({
      rate: 16000,
      channels: 1,
      device: deviceInfo.deviceId
    });

    micInstance.startRecording();

    // Add event listeners for data events to capture the audio data
    micInstance.on('data', (chunk) => {
      // Process audio data here
      console.log('Audio data:', chunk);
    });
  } catch (err) {
    console.error('Error creating microphone instance:', err);
  }
});

// Call the function to fetch audio sources when the script is executed
document.addEventListener('DOMContentLoaded', () => {
  getAudioSources();
});