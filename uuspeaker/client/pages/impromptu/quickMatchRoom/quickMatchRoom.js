var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')
var getlogininfo = require('../../../getlogininfo.js')
var userInfo = require('../../../common/userInfo.js')
var uuid = require('../../../common/uuid.js')
var audioService = require('../../../common/audioService.js')

var timeDurationMin = 30
var userId = ''
var roomId = ''
var waitSecondsId = ''
var isInRoom = 1
var rank
var coinPlay = 0
var speechAudioId= ''

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext();
const statusNotice = ['进入房间', '开始演讲', '完成演讲', '开始听你的演讲', '开始鼓励', '完成鼓励','开始听你的鼓励','离开房间']

const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3'
}

var timeDuration = 0 //演讲时间
var timeLimit = 120  //演讲总时间

var audioId = ''
var audioTypeArr = ['', '演讲', '鼓励']
//包含房间信息，房主信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomId: {},
    userInfo: {},
    matchedUser: {},
    matchedUserStatus:0,
    roomInfo: {},
    timeNoticeBackground: '',
    playNotice: 1,
    isPlay: 0,
    audioType: 1,
    speeches:{},
    speechStatus: 1,
    waitSeconds:13,
    studyStep:1,
    speechName:'',
    inputContent:'',

    minute: '00',
    second: '00',
    allAudio:[],
    messageNotice:'',

    isLikeUser:1,

    speechInfo: {audioId:'', src: '', timeDuration: 0, currentDuration:0,play: 0, sliderValue: 0, currentTime:'00:00',duration:'00:00'},
    evaluationInfo: {audioId:'', src: '', timeDuration: 0, currentDuration:0,play: 0, sliderValue: 0, currentTime: '00:00', duration: '00:00'},

    playNotice: 1,
    timeNoticeBackground: '',
  },

  updateViewTimes: function (audioId) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioView`,
      login: true,
      method: 'post',
      data: { audioId: audioId },
      success(result) {
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  playSpeechAudio: function(){
    if (this.data.matchedUserStatus < 2)return
    this.sendSpeech({ status: 3 })
    this.stopAllAudio()
    console.log('playSpeech', this.data.speechInfo.currentTime)
    innerAudioContext.src = this.data.speechInfo.src
    innerAudioContext.seek(this.data.speechInfo.currentDuration)
    innerAudioContext.play()
    //innerAudioContext.seek(this.data.speechInfo.currentTime)
    this.data.speechInfo.play = 1
    this.setData({
      speechInfo: this.data.speechInfo
    })
    this.updateViewTimes(this.data.speechInfo.audioId)
  },

  stopSpeechAudio: function(){
    innerAudioContext.pause()
    console.log('stop currentTime',this.data.speechInfo.currentTime)
    this.data.speechInfo.play = 0
    this.setData({
      speechInfo: this.data.speechInfo
    })
  },
  playEvaluationAudio: function(){
    if (this.data.matchedUserStatus < 5) return
    this.sendSpeech({ status: 6 })
    this.stopAllAudio()
    innerAudioContext.src = this.data.evaluationInfo.src
    innerAudioContext.seek(this.data.evaluationInfo.currentDuration)
    innerAudioContext.play()
    this.data.evaluationInfo.play = 1
    this.setData({
      evaluationInfo: this.data.evaluationInfo
    })
    this.updateViewTimes(this.data.evaluationInfo.audioId)
  },

  stopEvaluationAudio: function(){
    innerAudioContext.pause()
    this.data.evaluationInfo.play = 0
    this.setData({
      evaluationInfo: this.data.evaluationInfo
    })
  },

  stopAllAudio: function(){
    innerAudioContext.pause()
    this.data.speechInfo.play = 0
    this.data.evaluationInfo.play = 0
    this.setData({
      speechInfo: this.data.speechInfo,
      evaluationInfo: this.data.evaluationInfo,
    })
  },

  // 进入rtcroom页面
  getRoomInfo: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickRoom`,
      login: true,
      data: { 'roomId': roomId },
      method: 'get',
      success(result) {
        console.log(result.data.data)
        var roomInfo = result.data.data
        for (var i = 0; i < roomInfo.userList.length; i++) {
          if (roomInfo.userList[i].userId != userId) {
            that.setData({
              roomInfo: roomInfo,
              matchedUser: roomInfo.userList[i],
              speeches: roomInfo.speeches
            })
          }
        }

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  initUserInfo: function () {
    var that = this
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success(result) {
        that.setData({
          userInfo: result.data.data,
        })
      },

      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      }
    })
  },
  

  startTime: function () {
    this.setData({
      isPlay: 1
    })
    this.stopAllAudio()
    recorderManager.start(options)
    timeDuration = 0
    audioId = uuid.v1()
    console.log('startTime audioId ', audioId)
    this.recordTime()
  },

  stopTime: function () {
    this.setData({
      isPlay: 0
    })
    recorderManager.stop();
  },

  startSpeech: function(){
    if(isInRoom == 0)return
    this.sendSpeech({ status: 1 })
    this.startTime()
    this.setData({
      audioType:1
    })
    timeLimit = 120
  },
  stopSpeech: function(){
    //wx.hideLoading()
    //this.sendSpeech({ status: 2, audioId: audioId, timeDuration: timeDuration})
    this.stopTime()
    this.setData({
      studyStep: 2
    })
  },
  startEvaluation: function(){
    this.sendSpeech({ status: 4 })
    this.setData({
      audioType: 2
    })
    timeLimit = 60
    this.startTime()
  },
  stopEvaluation: function(){
    wx.hideLoading()
    //this.sendSpeech({ status: 5, audioId: audioId, timeDuration: timeDuration})
    this.stopTime()
    this.setData({
      studyStep: 3
    })
  },
  startReview: function(){
    this.setData({
      audioType: 3
    })
    this.startTime()
    timeLimit = 60
  },
  stopReview: function(){
    wx.hideLoading()
    //this.sendSpeech({ status: 5, audioId: audioId, timeDuration: timeDuration})
    this.stopTime()
    this.setData({
      studyStep: 4
    })
  },

  recordTime: function () {
    if (this.data.isPlay == 0) {
      timeDuration = timeDuration - 1
      return
    }
    if (timeDuration % 2 ==0){
      wx.showToast({
        title: '录音中',
        image: '../../../images/audioDetail/voice2.png',
      })
    }else{
      wx.showToast({
        title: '录音中',
        image: '../../../images/audioDetail/voice3.png',
      })
    }
    if (timeDuration >= timeLimit + 15) {
      if(this.data.audioType == 1){
        this.stopSpeech()
      }
      if (this.data.audioType == 2){
        this.stopEvaluation()
      }
      if (this.data.audioType == 3) {
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
    var minute = this.formatTime(timeDuration / 60)
    var second = this.formatTime(timeDuration % 60)
    this.setData({
      minute: minute,
      second: second,
      timeNoticeBackground: timeNoticeBackground
    })
    timeDuration++
    setTimeout(this.recordTime, 1000)
  },

  formatTime: function (time) {
    var formatedTime = Math.floor(time)
    if (formatedTime < 10) {
      formatedTime = '0' + formatedTime
    }
    return formatedTime
  },

  getFormatTimeForAudio: function(seconds){
    var minute = this.formatTime(seconds / 60)
    var second = this.formatTime(seconds % 60)
    return minute + ':' + second
  },

  noticePlay: function () {
    if (this.data.isPlay == 0) {
      this.setData({
        playNotice: 1
      })
      return
    }
    if (this.data.playNotice == 1) {
      this.setData({
        playNotice: 0.2
      })
    } else {
      this.setData({
        playNotice: 1
      })
    }
    setTimeout(this.noticePlay, 600)
  },

  //保存录音文件
  saveAudio: function (tempFilePath) {
    util.showBusy('保存中...')
    var that = this
    console.log('saveAudio.tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (result) {
        console.log('saveAudio success')
        if (that.data.audioType == 1){
          that.saveSpeechData()
        }
        if (that.data.audioType == 2){
          that.saveEvaluationData()
        }
        if (that.data.audioType == 3) {
          that.saveReviewData()
        }
      },

      fail: function (error) {
        util.showModel('录音保存失败', error);
      }
    })
  },

  saveSpeechData: function () {
    speechAudioId = audioId
    var requestData = { roomId: roomId, audioName: this.data.speechName, audioId: audioId, timeDuration: timeDuration, audioType: 1 }
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      data: requestData,
      method: 'post',
      success(result) { 
        util.showSuccess('演讲保存成功')
        wx.showToast({
          title: '完成演讲 +1',
          image: '../../../images/impromptuMeeting/money.png',
        })
        console.log(result)
        var src = result.data.data
        that.sendSpeech({ status: 2, audioId: audioId, timeDuration: timeDuration, src: src })
        that.playAudioOfMatchedUser()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  saveEvaluationData: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioComment`,
      login: true,
      data: { 'roomId': roomId , evaluationAudioId: audioId, targetAudioId: this.data.speechInfo.audioId, timeDuration: timeDuration, audioType: 2 },
      method: 'post',
      success(result) {
        wx.showToast({
          title: '完成鼓励 +1',
          image: '../../../images/impromptuMeeting/money.png',
        })
        console.log(result)
        var src = result.data.data
        that.sendSpeech({ status: 5, audioId: audioId, timeDuration: timeDuration, src: src })
        that.playAudioOfMatchedUser()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },
  saveReviewData: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioComment`,
      login: true,
      data: { 'roomId': roomId , evaluationAudioId: audioId, targetAudioId: speechAudioId, timeDuration: timeDuration, audioType: 2 },
      method: 'post',
      success(result) {
        wx.showToast({
          title: '完成复盘 +1',
          image: '../../../images/impromptuMeeting/money.png',
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  playAudioOfMatchedUser: function(){
    if (this.data.isPlay == 1)return
    if (this.data.audioType == 1 && this.data.matchedUserStatus == 2){
      this.playSpeechAudio()
    }
    if (this.data.audioType == 2 && this.data.matchedUserStatus == 5){
      this.playEvaluationAudio()
    }
  },

  updateSpeechStatus: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickRoom`,
      login: true,
      data: { roomId: '', audioId: audioId, timeDuration: timeDuration, audioType: this.data.audioType },
      method: 'post',
      success(result) {
        util.showSuccess('录音保存成功')
        console.log(result)
        if (that.data.audioType == 1) {
          that.data.audioType = 2
        } else if (that.data.audioType == 2) {
          that.data.audioType = 3
        }
        that.setData({
          audioType: that.data.audioType
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  readyToSpeech: function(){
    this.updateUserStatus()
    this.setData({
      speechStatus:1
    })
  },

  updateUserStatus: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickRoom`,
      login: true,
      data: { roomId: roomId, userId: userId},
      method: 'put',
      success(result) {
        //util.showSuccess('录音保存成功')
        console.log(result)
        if (that.data.audioType == 1) {
          that.data.audioType = 2
        } else if (that.data.audioType == 2) {
          that.data.audioType = 3
        }
        that.setData({
          audioType: that.data.audioType
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    rank = options.rank
    this.initData()
    // innerAudioContext.autoplay = true
    // innerAudioContext.src = 'https://uuspeaker-1255679565.cos.ap-guangzhou.myqcloud.com/audio/5d412900-546d-11e8-840e-79d6fa3f1ef2.mp3'
    //util.showSuccess('10秒后开始演讲')
    console.log(options)
    userId = options.userId
    roomId = options.roomId
    //getRoomInfoId = setInterval(this.getRoomInfo,3000)
    this.setData({
      matchedUser: { avatarUrl: options.avatarUrl,nickName:options.nickName,userId: options.matchUserId},
      speechName: options.speechName
    })
    this.initUserInfo()
    this.initAudio()
    this.openTunnel()
    this.isLikeUser()
    //this.waitToBegin()
    //setTimeout(this.startSpeech,16000)
    waitSecondsId = setInterval(this.waitToBegin, 1000)
  },

  initData: function(){
    this.setData({
      audioType: 1,
      speechStatus: 1,
      speechInfo: { audioId: '', src: '', timeDuration: 0, currentDuration: 0, play: 0, sliderValue: 0, currentTime: '00:00', duration: '00:00' },
      evaluationInfo: { audioId: '', src: '', timeDuration: 0, currentDuration: 0, play: 0, sliderValue: 0, currentTime: '00:00', duration: '00:00' },
    })
  },

  waitToBegin: function(){
    if(isInRoom == 0){
      clearInterval(waitSecondsId)
      return
    }
    console.log(this.data.waitSeconds)
    this.data.waitSeconds = this.data.waitSeconds - 1
    this.setData({
      waitSeconds: this.data.waitSeconds
    })
    if (this.data.waitSeconds == 0){
      clearInterval(waitSecondsId)
      this.startSpeech()
    }
  },

  initAudio: function () {
    recorderManager.onStop((res) => {
      // if (timeDuration < timeDurationMin){
      //   util.showSuccess('录音太短不做保存')
      //   return
      // } 
      //util.showSuccess('录音结束')
      this.setData({
        isPlay: 0,
      })
      this.saveAudio(res.tempFilePath)
    })

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      console.log('开始播放', innerAudioContext.currentTime)
      wx.hideLoading()
    })
    innerAudioContext.onWaiting(() => {
      // if (innerAudioContext.duration < 5) return
      // if (innerAudioContext.src == audioService.getSrc()) return
      wx.showLoading({
        title: '音频加载中',
      })
    })
    innerAudioContext.onTimeUpdate(() => {
      //if (innerAudioContext.src == audioService.getSrc()) return
      if (this.data.speechInfo.play == 1) {
        this.data.speechInfo.sliderValue = (100 * innerAudioContext.currentTime / innerAudioContext.duration)
        this.data.speechInfo.currentTime = this.getFormatTimeForAudio(Math.floor(innerAudioContext.currentTime))
        this.data.speechInfo.currentDuration = Math.floor(innerAudioContext.currentTime)
        this.setData({
          speechInfo: this.data.speechInfo
        })
      }
      if (this.data.evaluationInfo.play == 1) {
        this.data.evaluationInfo.sliderValue = (100 * innerAudioContext.currentTime / innerAudioContext.duration)
        this.data.evaluationInfo.currentTime = this.getFormatTimeForAudio(Math.floor(innerAudioContext.currentTime))
        this.data.evaluationInfo.currentDuration = Math.floor(innerAudioContext.currentTime)
        this.setData({
          evaluationInfo: this.data.evaluationInfo
        })
      }
    })

    innerAudioContext.onStop((res) => {
      this.data.speechInfo.play = 0
      this.data.evaluationInfo.play = 0
      this.setData({
        speechInfo: this.data.speechInfo,
        evaluationInfo: this.data.evaluationInfo,
      })
    })
    innerAudioContext.onEnded((res) => {
      audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      if (this.data.speechInfo.play == 1) {
        this.data.speechInfo.sliderValue = 0
        this.data.speechInfo.currentTime = '00:00'
        this.data.speechInfo.currentDuration = 0
        this.data.speechInfo.play = 0
        this.setData({
          speechInfo: this.data.speechInfo
        })
      }
      if (this.data.evaluationInfo.play == 1) {
        this.data.evaluationInfo.sliderValue = 0
        this.data.evaluationInfo.currentTime = '00:00'
        this.data.evaluationInfo.currentDuration = 0
        this.data.evaluationInfo.play = 0
        this.setData({
          evaluationInfo: this.data.evaluationInfo
        })
      }
    })

    innerAudioContext.onError((res) => {
      wx.hideLoading()
      util.showNotice('音频加载失败')
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  changeSpeechSlider: function(e){
    if(e.currentTarget.dataset.play == 0)return
    innerAudioContext.seek(innerAudioContext.duration * e.detail.value / 100)
  },

  openTunnel: function () {
    //util.showBusy('信道连接中...')
    // 创建信道，需要给定后台服务地址
    
    console.log(this.tunnel)
    this.tunnel = new qcloud.Tunnel(`${config.service.host}/weapp/impromptu.meetingUrl?rank=` + rank)
    console.log(this.tunnel)
    var tunnel = this.tunnel
    console.log('quickMatchRoom 初始化信道服务', tunnel)

    // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
    tunnel.on('connect', () => {
      //util.showSuccess('信道已连接')
      console.log('quickMatchRoom 信道已连接')
      this.setData({ tunnelStatus: 'connected' })
    })

    tunnel.on('close', () => {
      //util.showSuccess('信道已断开')
      console.log('quickMatchRoom 信道已断开')
      this.setData({ tunnelStatus: 'closed' })
    })

    tunnel.on('reconnecting', () => {
      console.log('quickMatchRoom 信道正在重连...')
      //util.showBusy('正在重连')
    })

    tunnel.on('reconnect', () => {
      console.log('quickMatchRoom 信道重连成功')
      //util.showSuccess('重连成功')
    })

    tunnel.on('error', error => {
      //util.showModel('信道发生错误', error)
      console.error('quickMatchRoom 信道发生错误：', error)
    })

    // 监听自定义消息（服务器进行推送）
    tunnel.on('speech', speak => {
      //util.showModel('信道消息', speak)
      console.log('quickMatchRoom 收到说话消息：', speak)
      if (speak.who.openId == this.data.matchedUser.userId){
        if (speak.data.status == 101){
          this.setData({
            messageNotice: speak.who.nickName + '关注了你'
          })
          return
        }
        if (speak.data.status == 102) {
          this.setData({
            messageNotice: speak.who.nickName + '：' +speak.data.text
          })
          return
        }
        this.updateMatchedUserStatus(speak.data.status)
        if (speak.data.status == 2){
          this.initAudioInfo(this.data.speechInfo,speak.data)
          this.setData({
            speechInfo: this.data.speechInfo
          })
        }
        if (speak.data.status == 5) {
          this.initAudioInfo(this.data.evaluationInfo, speak.data)
          this.setData({
            evaluationInfo: this.data.evaluationInfo
          })
        }
        this.playAudioOfMatchedUser()
        this.setData({
          messageNotice: speak.who.nickName + statusNotice[speak.data.status]
        })
      }
      
    })

    // 打开信道
    tunnel.open()
    setTimeout(this.sendSpeech, 1000, { status: 0 })
    //this.sendSpeech({ status: 1 })
    this.setData({ tunnelStatus: 'connecting' })
  },

  updateMatchedUserStatus: function(status){
    if (this.data.matchedUserStatus >= status)return
    this.setData({
      matchedUserStatus : status
    })
  },

  initAudioInfo: function(audioInfo,data){
    audioInfo.audioId = data.audioId
    audioInfo.timeDuration = data.timeDuration
    audioInfo.src = data.src
    audioInfo.duration = this.getFormatTimeForAudio(data.timeDuration)
    return audioInfo
  },

  /**
   * 点击「发送消息」按钮，测试使用信道发送消息
   */
  sendMessage() {
    if (!this.data.tunnelStatus || !this.data.tunnelStatus === 'connected') return
    // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
    if (this.tunnel && this.tunnel.isActive()) {
      // 使用信道给服务器推送「speak」消息
      this.tunnel.emit('speak', {
        'word': 'I say something at ' + new Date(),
        status:0
      });
    }
  },
  /**
   * 点击「发送消息」按钮，测试使用信道发送消息
   */
  sendSpeech(content) {
    // 信道当前不可用
    if (!this.tunnel || !this.tunnel.isActive()) {
      //util.showSuccess('连接失败')
      return
    }
    // 使用信道给服务器推送「speak」消息
    content.targetUserId = this.data.matchedUser.userId
    this.tunnel.emit('speech', content);
  },

  /**
   * 点击「关闭信道」按钮，关闭已经打开的信道
   */
  closeTunnel() {
    if (this.tunnel) {
      this.tunnel.close();
    }
    //util.showBusy('信道连接中...')
    this.setData({ tunnelStatus: 'closed' })
  },

  completeStudy: function(){
    this.closeTunnel()
    // wx.navigateTo({
    //   url: '../../impromptu/quickMatch/quickMatch?start=1',
    // })
    wx.navigateBack({
      
    })
  },

  isLikeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: this.data.matchedUser.userId },
      method: 'get',
      success(result) {
        that.setData({
          isLikeUser: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  likeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: this.data.matchedUser.userId },
      method: 'post',
      success(result) {
        util.showSuccess('已关注用户')
        that.setData({
          isLikeUser: 1
        })
        that.sendSpeech({status:101})
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  sendTextMessage: function(e){
    if (e.detail.value == '')return
    this.sendSpeech({ status: 102,text:e.detail.value })
    this.setData({ inputContent: '', messageNotice: '我：' + e.detail.value});
  },
  sendSystemMessage: function(content){
    if (e.detail.value == '')return
    this.sendSpeech({ status: 102, text: content })
  },

  onHide: function () {
    //this.stopTime()
    // this.sendSpeech({ status: 7 })
    // if (this.tunnel) {
    //   this.tunnel.close();
    // }
  },

  onShow: function(){
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    isInRoom = 1
    
  },

  onUnload: function () {
    clearInterval(waitSecondsId)
    isInRoom = 0
    this.stopTime()
    if (this.data.matchedUserStatus != 7){
      this.sendSpeech({ status: 7 })
    }
    
    this.closeTunnel()
    this.stopAllAudio()
    //innerAudioContext.destroy()
  },
})