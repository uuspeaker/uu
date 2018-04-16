var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var audioService = require('../../../common/audioService.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')

const innerAudioContext = wx.createInnerAudioContext()
var timeDuration = 0
var startDate
var endDate

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: 0,
    taskName: ''
  },

  //用户按下录音按钮
  startRecord: function () {
    audioService.start()
    startDate = new Date()
  },

  taskNameInput: function(e){
    this.setData({
      taskName: e.detail.value
    })
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

      var that = this
      wx.showModal({
        title: '提示',
        content: '是否保存录音？',
        success: function (sm) {
          if (sm.confirm) {
            setTimeout(audioService.saveAudio, 300, taskId)
            that.saveAudioRecord(taskId)
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })


  },

  //完成任务
  saveAudioRecord: function (taskId) {
    console.log('saveAudioRecord')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.specialTask`,
      login: true,
      data: { taskId: taskId, timeDuration: timeDuration, taskName: this.data.taskName },
      method: 'post',
      success(result) {
        util.showSuccess('录音保存成功')
        that.setData({
          isCompleteTask: 1
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  setName: function(e){
    var taskName = e.currentTarget.dataset.task_name
    this.setData({
      taskName: taskName
    })
  },

  toMySpecialTask:function(){
    wx.navigateTo({
      url: '../mySpecialTask/mySpecialTask',
    })
  }



})