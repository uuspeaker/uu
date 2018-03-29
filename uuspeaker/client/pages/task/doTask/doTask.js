var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var audioService = require('../../../common/audioService.js')
var uuid = require('../../../common/uuid.js')

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
    isCompleteTask: 0,
    isPlay: 0,
    userTask: {},
    oldTaskId: '0',
  },

  startRecord: function () {
    audioService.start()
    startDate = new Date()
  },

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
    setTimeout(audioService.saveAudio, 300, taskId)

    if (this.data.isCompleteTask == 1) {
      var that = this
      wx.showModal({
        title: '提示',
        content: '是否替换原有介绍？',
        success: function (sm) {
          if (sm.confirm) {
            that.saveAudioRecord(taskId)
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      this.saveAudioRecord(taskId)
      this.setData({
        isCompleteTask: 1
      })
    }

  },

  saveAudioRecord: function (taskId) {
    console.log('saveAudioRecord')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userTask`,
      login: true,
      data: { taskId: taskId, timeDuration: timeDuration, oldTaskId: this.data.oldTaskId ,taskType: this.data.taskType},
      method: 'post',
      success(result) {
        util.showSuccess('录音保存成功')
        that.setData({
          isCompleteTask: 1
        })
        that.getUserTask()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getUserTask: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userTask`,
      login: true,
      data: {taskType: this.data.taskType},
      method: 'get',
      success(result) {
        //console.log(result.data.data)
        if (result.data.data.length == 0) {
          that.setData({
            isCompleteTask: 0
          })

        } else {
          that.setData({
            userTask: result.data.data[0],
            isCompleteTask: 1,
            oldTaskId: result.data.data[0].task_id
          })
          innerAudioContext.src = result.data.data[0].src
          console.log('src', innerAudioContext.src)
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  doRecordAgain: function () {
    this.setData({
      isCompleteTask: 0
    })
  },

  toTaskIndex: function () {
    wx.navigateTo({
      url: '../../task/taskIndex/taskIndex',
    })
  },

  play: function () {
    innerAudioContext.play()
    console.log('play', innerAudioContext.autoplay)
    this.setData({
      isPlay: 1
    })
  },

  stop: function () {
    innerAudioContext.stop()
    this.setData({
      isPlay: 0
    })
  },

  onLoad: function (options) {
    this.setData({
      taskType: options.taskType,
      isCompleteTask: 0,
      isPlay: 0,
      userTask: {},
      oldTaskId: '0',
    })
    this.getUserTask()
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      console.log('onStop')
      this.setData({
        isPlay: 0
      })
    })
    innerAudioContext.onEnded((res) => {
      console.log('onEnd')
      this.setData({
        isPlay: 0
      })
    })
  },

  onShow: function(){
    
  },

})