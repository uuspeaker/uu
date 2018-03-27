var config = require('../config')
var uuid = require('uuid.js')
const recorderManager = wx.getRecorderManager()
var audioId = ''
var tempFilePath = ''

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
  tempFilePath = res.tempFilePath
})

const saveAudio = () => {
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
  audioId = uuid.v1()
  return audioId
}

const stop = () => {
  recorderManager.stop();
}

module.exports = { start, stop, saveAudio }