var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var base64 = require('../../../utils/base64-arraybuffer.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')
var audioService = require('../../../common/audioService.js')

var tempFilePath = ''
var coinPlay = 0
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext();
var timeLimit = { normal: 120, over: 15, green: 60, yellow: 30, red: 0 }

var timeDuration = 0
var startDate
var endDate
var waitSecondsId
var isInRoom = 1
var audioId
var speedArray = []
var lastTime = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
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
    waitSeconds:11,
    speechType:'',
    speed:0,
  },

  waitToBegin: function () {
    if (isInRoom == 0) {
      clearInterval(waitSecondsId)
      return
    }
    console.log(this.data.waitSeconds)
    this.data.waitSeconds = this.data.waitSeconds - 1
    this.setData({
      waitSeconds: this.data.waitSeconds
    })
    if (this.data.waitSeconds == 0) {
      clearInterval(waitSecondsId)
      this.startRecord()
    }
  },

  initViewStyle: function () {
    var initViewStyle = new Array(10)
    for (var i = 0; i < initViewStyle.length; i++) {
      initViewStyle[i] = ''
    }
    this.setData({
      viewStyle: initViewStyle
    })
  },

  pressView: function (index) {
    //if (this.data.speechType == index)return
    this.initViewStyle()
    var tmpViewStyle = this.data.viewStyle
    tmpViewStyle[index] = 'font-weight: bold;color: #576b95;font-size: 16px;'
    this.setData({
      viewStyle: tmpViewStyle,
      speechType: index,
      minute: '00',
      second: '00',
      audioName:'',
      speed:0,
      audioText:''
    })
    var that = this
  },

  doSpeech: function (e) {
    var index = e.currentTarget.dataset.item
    if(index == 0){
      timeLimit = { normal: 120, over: 15, green: 60, yellow: 30, red: 0 }
    }else{
      timeLimit = { normal: 420, over: 30, green: 120, yellow: 60, red: 0 }
    }
    this.pressView(index) 
  },

  //用户按下录音按钮
  startRecord: function () {
    timeDuration = 0 
    lastTime = 0
    speedArray = []
    recorderManager.start(config.options)
    startDate = new Date()
    this.setData({
      isPlay:1,
      audioText:''
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

    if (timeDuration >= timeLimit.normal + timeLimit.over) {
      this.stopRecord()
    }

    var timeNoticeBackground = ''
    if (timeDuration >= timeLimit.normal) {
      timeNoticeBackground = 'color:red'
    } else if (timeDuration >= timeLimit.normal - timeLimit.yellow) {
      timeNoticeBackground = 'color:orange'
    } else if (timeDuration >= timeLimit.normal - timeLimit.green) {
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


  //用户放开录音按钮
  stopRecord: function () {
    recorderManager.stop();
    this.setData({
      isPlay: 0,
      waitSeconds:11
    })
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 3) {
      util.showModel('录音太短', '请录制一段超过10秒的语音');
      return
    }
    audioId = uuid.v1()
    util.showBusy('保存中...')
    setTimeout(this.saveAudio, 2000)
  },

   saveAudio: function(){
     var that = this
    console.log('tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (result) {
        that.saveAudioRecord(audioId)
      },

      fail: function (e) {
        console.error(e)
      }
    })
  },

   getSpeechName: function () {
     wx.showLoading({
       title: '出题中',
     })
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
         waitSecondsId = setInterval(that.waitToBegin, 1000)
         
       },
       fail(error) {
         util.showModel('请求失败', error);
         console.log('request fail', error);
       }
     })
   },


  //完成任务
   saveAudioRecord: function (audioId) {
    var that = this
    var audioText = ''
    for (var i = 0; i < speedArray.length; i++) {
      audioText = audioText + speedArray[i].data
    }
    qcloud.request({
      url: `${config.service.host}/weapp/task.specialTask`,
      login: true,
      data: { taskId: audioId, timeDuration: timeDuration, audioName: this.data.audioName, audioText: audioText,audioType:1,speechType:this.data.speechType },
      method: 'post',
      success(result) {
        wx.showToast({
          title: '完成演讲 +1',
          image: '../../../images/impromptuMeeting/money.png',
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
     timeLimit = { normal: 120, over: 15, green: 60, yellow: 30, red: 0 }
     isInRoom = 1
     this.initAudio()
     this.pressView(0) 
     //this.queryHotTask()
   },

   onReady: function(){
     wx.setNavigationBarTitle({ title: '自由练习' });
     wx.setKeepScreenOn({
       keepScreenOn: true
     })
   },

  initAudio: function () {
    recorderManager.onStop((res) => {
      tempFilePath = res.tempFilePath
    })

    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      this.translate(frameBuffer)
    })
  },

  translate: function(audioBuff){
    var currentDuration = timeDuration - lastTime
    lastTime = timeDuration
    //console.log('old audioBuff', audioBuff)
    var audioBuff = base64.encode(audioBuff)
    //console.log('new audioBuff', audioBuff)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioToText`,
      login: true,
      data: { 'audioBuff': audioBuff,audioType:1},
      method: 'post',
      success(result) {
        console.log('audioToText', result)
        var resultData = result.data.data
        console.log('resultData', resultData)
        var chineseReg = /[\u4e00-\u9fa5]/g;
        var chineseLength = 0;
        if (resultData.match(chineseReg) != null) {
          chineseLength = (resultData.match(chineseReg)).length;
        }
        speedArray.push({ duration: currentDuration, length: chineseLength, data: resultData})
        that.updateSpeed()
        // that.setData({
        //   audioText: that.data.audioText + resultData,
        // })

      },
      fail(error) {
        console.log('translate fail', error);
      }
    })
  },

  updateSpeed:function(){
    console.log('speedArray', speedArray)
    var maxSpeech = 0
    for(var i=0; i<speedArray.length; i++){
      var currentSpeed = speedArray[i].length / speedArray[i].duration
      if (currentSpeed > maxSpeech){
        maxSpeech = currentSpeed
      }
    }

    var totalLength = 0
    var totalDuration = 0
    for (var i = 0; i < speedArray.length; i++) {
      var currentSpeed = speedArray[i].length / speedArray[i].duration
      if (currentSpeed > maxSpeech / 5 ) {
        totalLength = totalLength + speedArray[i].length
        totalDuration = totalDuration + speedArray[i].duration
      }
    }

    this.setData({
      speed: Math.floor(60 * totalLength / totalDuration)
    })
  },

  onUnload: function(){
    clearInterval(waitSecondsId)
    isInRoom = 0
    this.setData({
      isPlay: 0
    })
    recorderManager.stop();
  },



})