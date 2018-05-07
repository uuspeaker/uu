var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')
var getlogininfo = require('../../../getlogininfo.js')
var userInfo = require('../../../common/userInfo.js')
var uuid = require('../../../common/uuid.js')

var timeDurationMin = 1
var userId = ''
var roomId = ''
var getRoomInfoId = ''
var waitSecondsId = ''

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext();

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
var audioTypeArr = ['', '演讲', '点评']
//包含房间信息，房主信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomId: {},
    userInfo: {},
    matchedUser: {},
    roomInfo: {},
    timeNoticeBackground: '',
    playNotice: 1,
    isPlay: 0,
    audioType: 1,
    speeches:{},
    speechStatus: 1,
    waitSeconds:10,

    minute: '00',
    second: '00',
    isPlay:0,
    audioType:1,

    speechInfo: { src: 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E06DCBDC9AB7C49FD713D632D313AC4858BACB8DDD29067D3C601481D36E62053BF8DFEAF74C0A5CCFADD6471160CAF3E6A&fromtag=46', duration: 60, play: 0, sliderValue:0},
    evaluationInfo:{},

    playNotice: 1,
    timeNoticeBackground: '',
  },

  playSpeech: function(){
    innerAudioContext.src = this.data.speechInfo.src
    innerAudioContext.play()
    this.data.speechInfo.play = 1
    this.setData({
      speechInfo: this.data.speechInfo
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
    wx.getUserInfo({
      withCredentials: false,
      lang: '',
      success(result) {
        that.setData({
          userInfo: result.userInfo
        })
      },
      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      },
      complete: function (res) {

      },
    })
  },

  stopTime: function () {
    recorderManager.stop();

  },

  startTime: function () {
    recorderManager.start(options)
    this.setData({
      isPlay: 1
    })
    timeDuration = 0
    audioId = uuid.v1()
    this.recordTime()
    this.noticePlay()
  },

  recordTime: function () {
    if (this.data.isPlay == 0) {
      timeDuration = timeDuration - 1
      return
    }
    var timeNoticeBackground = ''
    if (timeDuration >= timeLimit) {
      timeNoticeBackground = 'background-color:red'
    } else if (timeDuration >= timeLimit - 30) {
      timeNoticeBackground = 'background-color:yellow'
    } else if (timeDuration >= timeLimit - 60) {
      timeNoticeBackground = 'background-color:green'
    } else {

    }
    var minute = this.formatTime(timeDuration / 60)
    var second = this.formatTime(timeDuration % 60)
    this.setData({
      minute: minute,
      second: second,
      timeNoticeBackground: timeNoticeBackground
    })
    if (Math.floor(timeDuration % 30) == 0 && timeDuration != 0) {
      this.sendTextMsg('用时：' + dateFormat.getFormatDuration(timeDuration))
    }
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
    util.showBusy('请求中...')
    var that = this
    console.log('saveAudio.tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (res) {
        that.saveAudioData()
        that.updateSpeechStatus()
      },

      fail: function (error) {
        util.showModel('录音保存失败', error);
      }
    })
  },

  saveAudioData: function () {
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      data: { roomId: roomId, audioName: this.data.roomInfo.speechName, userId: userId, audioId: audioId, timeDuration: timeDuration, audioType: this.data.audioType },
      method: 'post',
      success(result) {
        util.showSuccess('录音保存成功')
        console.log(result)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  updateSpeechStatus: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickRoom`,
      login: true,
      data: { roomId: roomId, userId: userId, audioId: audioId, timeDuration: timeDuration, audioType: this.data.audioType },
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

  playAudio: function (e) {
    var src = e.currentTarget.dataset.src
    var audioId = e.currentTarget.dataset.audio_id
    innerAudioContext.src = src
    innerAudioContext.play()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.showSuccess('10秒后开始演讲')
    console.log(options)
    userId = options.userId
    roomId = options.roomId
    //getRoomInfoId = setInterval(this.getRoomInfo,3000)
    this.initUserInfo()
    this.initAudio()
    waitSecondsId = setInterval(this.waitToBegin,1000)

    
  },

  waitToBegin: function(){
    this.data.waitSeconds = this.data.waitSeconds - 1
    this.setData({
      waitSeconds: this.data.waitSeconds
    })
    if (this.data.waitSeconds == 0){
      clearInterval(waitSecondsId)
      util.showSuccess('请开始演讲')
    }
  },

  initAudio: function () {
    recorderManager.onStop((res) => {
      if (timeDuration < timeDurationMin) return
      this.saveAudio(res.tempFilePath)
      this.setData({
        isPlay: 0,
      })
    })

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      //wx.hideLoading()
      console.log('开始播放', innerAudioContext.currentTime)
    })
    innerAudioContext.onWaiting(() => {
      // wx.showLoading({
      //   title: '音频加载中',
      // })
    })
    innerAudioContext.onTimeUpdate(() => {
      
      if (this.data.speechInfo.play == 1) {
        
        var currentTime = innerAudioContext.currentTime
        this.data.speechInfo.sliderValue = (100 * innerAudioContext.currentTime / innerAudioContext.duration)
        this.setData({
          speechInfo: this.data.speechInfo
        })
      }
    })
  },

  changeSpeechSlider: function(e){
    innerAudioContext.seek(innerAudioContext.duration * e.detail.value / 100)
  },

  onHide: function () {
    clearInterval(getRoomInfoId)
  },

  onUnload: function () {
    clearInterval(getRoomInfoId)

  },
})