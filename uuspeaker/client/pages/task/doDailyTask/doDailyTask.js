var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var audioService = require('../../../common/audioService.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

const innerAudioContext = wx.createInnerAudioContext()

var showTimes = 0
var timeDuration = 0
var startDate
var endDate

var timetimeDuration = 0 //演讲时间

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskType: 0
  },

  //用户按下录音按钮
  startRecord: function () {
    audioService.start()
    startDate = new Date()
  },

  //用户放开录音按钮
  stopRecord: function () {
    audioService.stop()
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 1) {
      util.showModel('录音太短', '请录制一段超过10秒的语音');
      return
    }
    var taskId = uuid.v1()
    if (this.data.isCompleteTask == 1) {
      var that = this
      wx.showModal({
        title: '提示',
        content: '是否替换原有介绍？',
        success: function (sm) {
          if (sm.confirm) {
            setTimeout(audioService.saveAudio, 300, taskId)
            that.saveAudioRecord(taskId)
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      setTimeout(audioService.saveAudio, 300, taskId)
      this.saveAudioRecord(taskId)
      this.setData({
        isCompleteTask: 1
      })
    }

  },

  //完成任务
  saveAudioRecord: function (taskId) {
    console.log('saveAudioRecord')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userTask`,
      login: true,
      data: { taskId: taskId, timeDuration: timeDuration,taskType: this.data.taskType },
      method: 'post',
      success(result) {
        util.showSuccess('录音保存成功')
        that.setData({
          isCompleteTask: 1
        })
        //innerAudioContext.src = audioService.getSrc()
        that.getMyTask()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function(options){
    this.setData({
      taskType: options.taskType
    })

  }

})