var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var audioService = require('../../../common/audioService.js')
var uuid = require('../../../common/uuid.js')

var showTimes = 0
var audioId = ''
var timeDuration = 0
var startDate
var endDate

var timetimeDuration = 0 //演讲时间

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIntroduceOver: 0,
    userIntroduction: {}
  },

  startRecord: function () {
    audioId = audioService.start()
    startDate = new Date()
  },

  stopRecord: function () {
    audioService.stop();
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate)/1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 1){
      util.showModel('录音太短', '请录制一段超过10秒的自我介绍');
      return
    }
    setTimeout(audioService.saveAudio, 300)
    
    this.saveAudioRecord()
    this.setData({
      isIntroduceOver: 1
    })
  },

  saveAudioRecord: function () {
    console.log('saveAudioRecord')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userIntroduction`,
      login: true,
      data: { audioId: audioId, timeDuration: timeDuration},
      method: 'post',
      success(result) {
        that.setData({
          isIntroduceOver: 1
        })
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getUserIntroduction: function(){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userIntroduction`,
      login: true,
      data: {},
      method: 'get',
      success(result) {
        console.log(result.data.data)
        if (result.data.data.length == 0) {
          that.setData({
            userIntroduction: result.data.data[0],
            isIntroduceOver: 0
          })
        } else {
          that.setData({
            userIntroduction: result.data.data[0],
            isIntroduceOver: 1
          })
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  toTaskIndex: function(){
    wx.navigateTo({
      url: '../../task/taskIndex/taskIndex',
    })
  },

  onLoad: function(){
    this.getUserIntroduction()
  }

})