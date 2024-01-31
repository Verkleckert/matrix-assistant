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

// Call the function to fetch audio sources when the script is executed
document.addEventListener('DOMContentLoaded', () => {
  getAudioSources();
});