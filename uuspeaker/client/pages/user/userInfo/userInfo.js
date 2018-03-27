var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var audioService = require('../../../common/audioService.js')
var uuid = require('../../../common/uuid.js')

var showTimes = 0
var audioId = ''
var duration = 0
var startDate
var endDate

var timeDuration = 0 //演讲时间

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIntroduceOver: 0,
  },

  startRecord: function () {
    audioId = audioService.start()
    startDate = new Date()
  },

  stopRecord: function () {
    audioService.stop();
    endDate = new Date()
    duration = Math.floor((endDate - startDate)/1000)
    console.log('duration', duration)
    if (duration <= 3){
      util.showModel('录音太短', '请录制一段超过10秒的自我介绍');
      return
    }
    audioService.saveAudio()
    this.saveAudioRecord()
    this.setData({
      isIntroduceOver: 1
    })
  },

  saveAudioRecord: function () {
    qcloud.request({
      url: `${config.service.host}/weapp/user.userInfo`,
      login: true,
      data: { audioId: audioId, duration: duration},
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

  toTaskIndex: function(){
    wx.navigateTo({
      url: '../../task/taskIndex/taskIndex',
    })
  },

})