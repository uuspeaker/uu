var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')

const innerAudioContext = wx.createInnerAudioContext()
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''
var playAudioStartDate = ''
var coinPlay = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    audios: {},
    userId:'',
    userId:''
  },

  //查询最新房间信息
  queryImpromptuAudios: function (e) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.myAudio`,
      login: true,
      method: 'get',
      data: { userId: this.data.userId, queryPageType: queryPageType, firstDataTime: firstDataTime, lastDataTime: lastDataTime},
      success(result) {
        wx.hideLoading()
        console.log('queryImpromptuAudios' , result)
        if (result.data.data == '') {
          util.showSuccess('没有更多记录')
          return;
        }
        
        var resultData = []
        if (queryPageType == 0) {
          resultData = result.data.data
        } else if (queryPageType == 1) {
          resultData = [].concat(result.data.data, that.data.audios)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.audios, result.data.data)
        }

        that.setData({
          audios: resultData
        })
        var length = that.data.audios.length
        firstDataTime = that.data.audios[0].create_date
        lastDataTime = that.data.audios[length - 1].create_date
        that.formatDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDateAndStatus: function (src) {
    var data = this.data.audios
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].createDateStr = dateFormat.getSimpleFormatDate(data[i].create_date)
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      if (data[i].src == src) {
        data[i].isPlay = 1
      } else {
        data[i].isPlay = 0
      }

    }
    console.log(data)
    this.setData({
      audios: data
    })
  },

  playAudio: function (e) {
    this.updateViewTimes(e)
  },

  updateViewAmount: function (audioId) {
    var data = this.data.audios
    for (var i = 0; i < data.length; i++) {
      if (data[i].audio_id == audioId) {
        data[i].view_amount = data[i].view_amount + 1
      }
    }
    this.setData({
      audios: data
    })
  },

  updateViewTimes: function (e) {
    var src = e.currentTarget.dataset.src
    var audioId = e.currentTarget.dataset.audio_id
    innerAudioContext.src = src
    innerAudioContext.play()
    this.formatDateAndStatus(src)

    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioView`,
      login: true,
      method: 'post',
      data: { audioId: audioId },
      success(result) {
        that.updateViewAmount(audioId)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.stop()
    this.formatDateAndStatus()
  },

  onLoad: function (options) {
    queryPageType = 0
    firstDataTime = ''
    lastDataTime = ''

    if (options.userId == undefined) {

    } else {
      this.setData({
        userId: options.userId,
        nickName: options.nickName
      })
    }
    this.queryImpromptuAudios()
    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      console.log('开始播放', innerAudioContext.currentTime)
      wx.hideLoading()
    })
    innerAudioContext.onWaiting(() => {
      if (innerAudioContext.duration < 5) return
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
      this.formatDateAndStatus()
    })
    innerAudioContext.onEnded((res) => {
      audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      this.formatDateAndStatus()
    })
  },

  toAudioDetail: function (e) {
    wx.navigateTo({
      url: '../../impromptu/audioDetail/audioDetail?audioId=' + e.currentTarget.dataset.audio_id,
    })
  },

  onShow: function(){
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },


  onPullDownRefresh: function () {
    queryPageType = 1
    this.queryImpromptuAudios()
  },

  onReachBottom: function () {
    queryPageType = 2
    this.queryImpromptuAudios()
  },

  onUnload: function () {
    //innerAudioContext.stop();
    innerAudioContext.destroy()
  },

})