var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')

const innerAudioContext = wx.createInnerAudioContext()
var showTimes = 0
var audioId = ''
var tempFilePath = ''
var taskType = 1

const recorderManager = wx.getRecorderManager()

const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3'
}

var timeDuration = 0 //演讲时间

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRecord: 1,
  },

  startRecord: function () {
    recorderManager.start(options)
    this.setData({
      isRecord: 1
    })
  },

  stopRecord: function () {
    recorderManager.stop();
    this.setData({
      isRecord: 0
    })
    
  },

  saveAudio: function () {
    audioId = uuid.v1()
    var that = this
    var timeDuration = innerAudioContext.duration
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (res) {
        that.saveAudioRecord()
      },

      fail: function (e) {
        console.error(e)
      }
    })
  },

  saveAudioRecord: function () {
    qcloud.request({
      url: `${config.service.host}/weapp/task.userTask`,
      login: true,
      data: { audioId: audioId, taskType: taskType, timeDuration: timeDuration },
      method: 'post',
      success(result) {
        console.log(result)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  initAudio: function () {
    recorderManager.onStart(() => {
      console.log('recorder start')
    })
    recorderManager.onStop((res) => {
      tempFilePath = res.tempFilePath
      this.saveAudio()
    })
  },

  onLoad: function (options) {
    this.initAudio()
  },

})