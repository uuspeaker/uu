var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')
var audioService = require('../../../common/audioService.js')

var tempFilePath = ''
var coinPlay = 0
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext();
var timeLimit = 120

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
    audioName: '',
    audioText: '',
    hotTask:[],
    showContent:0,
    minute: '00',
    second: '00',
    timeNoticeBackground:'',
  },

  //用户按下录音按钮
  startRecord: function () {
    recorderManager.start(options)
    startDate = new Date()
    this.setData({
      isPlay:1
    })
    this.recordTime()
  },

  recordTime: function () {
    if (this.data.isPlay == 0) {
      timeDuration = timeDuration - 1
      return
    }
    if (timeDuration % 2 == 0) {
      wx.showToast({
        title: '录音中',
        image: '../../../images/audioDetail/voice2.png',
      })
    } else {
      wx.showToast({
        title: '录音中',
        image: '../../../images/audioDetail/voice3.png',
      })
    }
    if (timeDuration >= timeLimit + 15) {
      if (this.data.audioType == 1) {
        this.stopSpeech()
      }
      if (this.data.audioType == 2) {
        this.stopEvaluation()
      }
    }
    var timeNoticeBackground = ''
    if (timeDuration >= timeLimit) {
      timeNoticeBackground = 'color:red'
    } else if (timeDuration >= timeLimit - 30) {
      timeNoticeBackground = 'color:orange'
    } else if (timeDuration >= timeLimit - 60) {
      timeNoticeBackground = 'color:green'
    } else {

    }
    var minute = dateFormat.getNumberOfFixedWidth(timeDuration / 60)
    var second = dateFormat.getNumberOfFixedWidth(timeDuration % 60)
    this.setData({
      minute: minute,
      second: second,
      timeNoticeBackground: timeNoticeBackground
    })
    timeDuration++
    setTimeout(this.recordTime, 1000)
  },

  audioNameInput: function(e){
    console.log('audioNameInput',e)
    this.setData({
      audioName: e.detail.value
    })
  },

  audioTextInput: function (e) {
    this.setData({
      audioText: e.detail.value
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
    if (timeDuration <= 10) {
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

   getSpeechName: function () {
     wx.showLoading({
       title: '加载中',
     })
     console.log('saveAudioRecord')
     var that = this
     qcloud.request({
       url: `${config.service.host}/weapp/speech.speechNameRandom`,
       login: true,
       method: 'get',
       success(result) {
         wx.hideLoading()
         that.setData({
           audioName: result.data.data
         })
         
       },
       fail(error) {
         util.showModel('请求失败', error);
         console.log('request fail', error);
       }
     })
   },


  //完成任务
   saveAudioRecord: function (audioId) {
     var requestData = { taskId: audioId, timeDuration: timeDuration, audioName: this.data.audioName, audioText: this.data.audioText }
     console.log(requestData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.specialTask`,
      login: true,
      data: { taskId: audioId, timeDuration: timeDuration, audioName: this.data.audioName, audioText: this.data.audioText },
      method: 'post',
      success(result) {
        wx.showToast({
          title: '完成演讲 +1',
          image: '../../../images/impromptuMeeting/money.png',
        })
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

   onLoad:function(options){
     this.initAudio()
     this.setData({
       showContent: options.showContent
     })
     //this.queryHotTask()
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