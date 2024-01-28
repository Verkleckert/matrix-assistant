const ipcRenderer = window.ipcRenderer;

const startRecordBtn = document.getElementById('startRecord');
const stopRecordBtn = document.getElementById('stopRecord');
const audioDevicesSelect = document.getElementById('audioDevices');

startRecordBtn.addEventListener('click', () => {
  const selectedDeviceId = audioDevicesSelect.value;
  ipcRenderer.send('startRecording', selectedDeviceId);
});

stopRecordBtn.addEventListener('click', () => {
  ipcRenderer.send('stopRecording');
});

audioDevicesSelect.addEventListener('change', function(event) {
  const selectedValue = event.target.value;

//   // try {
    ipcRenderer.send('saveSetting', 'audioDevice', selectedValue);
  
    console.log('Selected audio device:', selectedValue);
//   // } catch (error) {
//   //   console.error('Error handling audio device change:', error.message);
//   // }
});