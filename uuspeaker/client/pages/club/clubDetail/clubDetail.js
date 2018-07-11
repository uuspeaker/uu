var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')

const innerAudioContext = wx.createInnerAudioContext()
var currentAudioIndex = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubName:'',
    clubFee:'',
    clubDescription:'',
    audios:[],
    isPlay:0,
    audioIndex:''
  },

  playAudio: function (e) {
    var src = this.data.audios[currentAudioIndex].src
    var currentDuration = this.data.audios[currentAudioIndex].currentDuration
    innerAudioContext.src = src
    innerAudioContext.seek(currentDuration)
    innerAudioContext.play()

    this.data.audios[currentAudioIndex].isPlay = 1
    this.setData({
      audios: this.data.audios,
      isPlay:1
    })
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.pause()
    this.data.audios[currentAudioIndex].isPlay = 0
    this.setData({
      audios: this.data.audios,
      isPlay:0
    })
  },

  changeSlider: function (e) {
    if (e.currentTarget.dataset.play == 0) return
    innerAudioContext.seek(innerAudioContext.duration * e.detail.value / 100)
  },

  initDateAndStatus: function (src, timeDuration) {
    var data = []
    data.push({ 'src': src, 'time_duration': timeDuration})
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      data[i].isPlay = 0
      data[i].timeDuration = data[i].time_duration
      data[i].currentDuration = 0
      data[i].sliderValue = 0
      data[i].currentTime = '00:00'
      data[i].duration = dateFormat.getFormatTimeForAudio(Math.floor(data[i].time_duration))
      data[i].audioIndex = i
    }
    console.log(data)
    this.setData({
      audios: data
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      clubName: options.clubName,
      clubFee: options.clubFee,
      clubDescription: options.clubDescription
    })
    this.initDateAndStatus(options.src,options.timeDuration)

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      wx.hideLoading()
    })
    innerAudioContext.onWaiting(() => {
      // if (innerAudioContext.duration < 5) return
      // if (innerAudioContext.src == audioService.getSrc()) return
      wx.showLoading({
        title: '音频加载中',
      })
    })
    innerAudioContext.onError((res) => {
      wx.hideLoading()
      util.showNotice('音频加载失败')
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      this.setData({
        currentLikeUser: []
      })
    })

    innerAudioContext.onTimeUpdate(() => {
      if (innerAudioContext.src == audioService.getSrc()) return
      this.data.audios[currentAudioIndex].sliderValue = (100 * innerAudioContext.currentTime / innerAudioContext.duration)
      this.data.audios[currentAudioIndex].currentTime = dateFormat.getFormatTimeForAudio(Math.floor(innerAudioContext.currentTime))
      this.data.audios[currentAudioIndex].currentDuration = Math.floor(innerAudioContext.currentTime)
      this.setData({
        audios: this.data.audios
      })
    })

    innerAudioContext.onEnded((res) => {
      //audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      this.data.audios[currentAudioIndex].sliderValue = 0
      this.data.audios[currentAudioIndex].currentTime = '00:00'
      this.data.audios[currentAudioIndex].currentDuration = 0
      this.data.audios[currentAudioIndex].isPlay = 0
      this.setData({
        audios: this.data.audios
      })

    })
  },

  onShow: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  onUnload: function () {
    innerAudioContext.stop();
  },


  
})