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
    waitSeconds:0
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userId = options.userId
    roomId = options.roomId
    getRoomInfoId = setInterval(this.getRoomInfo,3000)
    this.initUserInfo()
    this.initAudio()
    setInterval(this.wait,1000)
  },

  wait: function(){
    this.data.waitSeconds = this.data.waitSeconds + 1
    this.setData({
      waitSeconds: this.data.waitSeconds
    })
    if (this.data.waitSeconds >= 10){
      clearInterval(waitSecondsId)

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
  },

  onHide: function () {
    clearInterval(getRoomInfoId)
  },

  onUnload: function () {
    clearInterval(getRoomInfoId)

  },
})