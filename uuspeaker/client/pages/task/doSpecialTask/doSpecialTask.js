var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')

var tempFilePath = ''

const recorderManager = wx.getRecorderManager()

const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3'
}

var timeDuration = 0
var startDate
var endDate

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pressStyle: 'box-shadow: 0 2px 10px rgba(0, 49, 114, .5);',
    isPlay: 0,
    playNotice: 1,
    taskName: '',
    hotTask:[]
  },

  //用户按下录音按钮
  startRecord: function () {
    recorderManager.start(options)
    startDate = new Date()
    this.setData({
      pressStyle: 'box-shadow: 0px 0px 0px 0px;',
      isPlay:1

    })
    this.noticePlay()
  },

  noticePlay: function () {
    if (this.data.isPlay == 0){
      this.setData({
        playNotice: 1
      })
      return
    }
    if (this.data.playNotice == 1){
      this.setData({
        playNotice: 0.2
      })
    }else{
      this.setData({
        playNotice: 1
      })
    }
    setTimeout(this.noticePlay, 600)
  },

  taskNameInput: function(e){
    this.setData({
      taskName: e.detail.value
    })
  },

  //用户放开录音按钮
  stopRecord: function () {
    recorderManager.stop();
    this.setData({
      pressStyle: 'box-shadow: 0 2px 10px rgba(0, 49, 114, .5);',
      isPlay: 0
    })
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 1) {
      util.showModel('录音太短', '请录制一段超过10秒的语音');
      return
    }
    var audioId = uuid.v1()

      var that = this
      wx.showModal({
        title: '提示',
        content: '是否保存录音？',
        success: function (sm) {
          if (sm.confirm) {
            setTimeout(that.saveAudio, 100, audioId)
            
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
  },

   saveAudio: function(audioId){
     util.showBusy('请求中...')
     var that = this
    console.log('tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (res) {
        that.saveAudioRecord(audioId)
      },

      fail: function (e) {
        console.error(e)
      }
    })
  },

   queryHotTask: function () {
     wx.showLoading({
       title: '加载中',
     })
     console.log('saveAudioRecord')
     var that = this
     qcloud.request({
       url: `${config.service.host}/weapp/task.hotTask`,
       login: true,
       data: {},
       method: 'get',
       success(result) {
         wx.hideLoading()
         that.setData({
           hotTask: result.data.data
         })
         if (result.data.data != ''){
           that.setData({
             taskName: result.data.data[0].audio_name
           })
         }
         
       },
       fail(error) {
         util.showModel('请求失败', error);
         console.log('request fail', error);
       }
     })
   },


  //完成任务
   saveAudioRecord: function (audioId) {
    console.log('saveAudioRecord')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.specialTask`,
      login: true,
      data: { taskId: audioId, timeDuration: timeDuration, taskName: this.data.taskName },
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
  },

  toSpecialTaskList: function (e) {
    wx.navigateTo({
      url: '../specialTaskList/specialTaskList',
    })
  },

   onLoad:function(){
     this.initAudio()
     this.queryHotTask()
   },

   onReady: function(){
     wx.setNavigationBarTitle({ title: '自由练习' });
   },

  initAudio: function () {
    recorderManager.onStop((res) => {
      tempFilePath = res.tempFilePath
    })
  },



})