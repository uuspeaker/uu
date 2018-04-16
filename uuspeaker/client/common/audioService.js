var config = require('../config')
var uuid = require('uuid.js')
const recorderManager = wx.getRecorderManager()
var tempFilePath = '1'

const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3'
}

recorderManager.onStart(() => {
  console.log('recorder start')
})

recorderManager.onStop((res) => {
  console.log('res', res )
  tempFilePath = res.tempFilePath
})

const getSrc = () =>{
  return tempFilePath
}

const saveAudio = (audioId) => {
  console.log('tempFilePath', tempFilePath)
  const uploadTask = wx.uploadFile({
    url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
    filePath: tempFilePath,
    name: 'file',
    formData: { audioId: audioId },
    success: function (res) {

    },

    fail: function (e) {
      console.error(e)
    }
  })
}

const start = () => {
  recorderManager.start(options)
} 

const stop = () => {
  recorderManager.stop();
}

module.exports = { start, stop, saveAudio }