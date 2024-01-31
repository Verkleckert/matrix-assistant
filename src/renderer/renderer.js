const fs = require('fs')
const ipcRenderer = window.ipcRenderer;

const audioDevicesSelect = document.getElementById('audioDevices');

audioDevicesSelect.addEventListener('change', function (event) {
  const selectedValue = event.target.value;

  try {
  ipcRenderer.send('saveSetting', 'audioDevice', selectedValue);
  selectedDevice = selectedValue;
  setAudioDevice(selectedValue);

  console.log('Selected audio device:', selectedValue);
  } catch (error) {
    console.error('Error handling audio device change:', error.message);
  }
});

function setAudioDevice(deviceId) {
  console.log("Staring Audio Stream...")

  navigator.mediaDevices
    .getUserMedia({ audio: { deviceId: deviceId ? { exact: deviceId } : undefined } })
    .then((stream) => {

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported(mimeType)) {
        recorder = new MediaRecorder(stream, { mimeType });
      } else {
        console.warn(`'${mimeType}' is not supported. Trying 'audio/wav'.`);
        mimeType = 'audio/wav';
        if (MediaRecorder.isTypeSupported(mimeType)) {
          recorder = new MediaRecorder(stream, { mimeType });
        } else {
          console.error(`'${mimeType}' is not supported in this browser.`);
          return;
        }
      }

      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();

        reader.onloadend = () => {
          const buffer = Buffer.from(reader.result);
          const filePath = 'recordedAudio.' + mimeType.split('/')[1];

          fs.writeFile(filePath, buffer, { flag: 'w' }, (err) => {
            if (err) throw err;
            console.log('Audio saved successfully!');
          });
        };

        reader.readAsArrayBuffer(blob);
      };

      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, 3000);
      setTimeout(() => {}, 3000);
    })
    .catch((err) => console.error('getUserMedia Error:', err));
}