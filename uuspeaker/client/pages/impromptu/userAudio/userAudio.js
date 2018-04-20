var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

const innerAudioContext = wx.createInnerAudioContext()
var showTimes = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    audios: {},
    roomId: '',
    audioLikeUser: [],
    currentLikeUser: []
  },

  //查询最新房间信息
  queryImpromptuAudios: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      method: 'get',
      data: { roomId: this.data.roomId},
      success(result) {
        console.log(result)
        that.setData({
          audios: result.data.data
        })
        if(result.data.data == ''){
          util.showSuccess('没有录音信息')
        }
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
      if(data[i].src == src){
        data[i].isPlay = 1
      }else{
        data[i].isPlay = 0
      }      
    }
    console.log(data)
    this.setData({
      audios: data
    })
  },

  switchPlayStatus: function (src) {
    var data = this.data.audios
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
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

  playAudio: function(e){
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

  editAudio: function (e) {
    var audioId = e.currentTarget.dataset.audio_id
    var audioName = e.currentTarget.dataset.audio_name
    var audioText = e.currentTarget.dataset.audio_text
    wx.navigateTo({
      url: '../../impromptu/myAudioManage/myAudioManage?audioId=' + audioId + '&audioName=' + audioName + '&audioText=' + audioText
    })
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.stop()
    this.formatDateAndStatus()
  },

  onLoad: function (options) {
    console.log(options)
    this.setData({
      roomId: options.roomId
    })

    innerAudioContext.onPlay(() => {
      console.log('开始播放', innerAudioContext.currentTime)
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      this.formatDateAndStatus()
      this.setData({
        currentLikeUser: []
      })
    })
    innerAudioContext.onEnded((res) => {
      this.formatDateAndStatus()
      this.setData({
        currentLikeUser: []
      })
    })
  },

  onShow: function(){
    this.queryImpromptuAudios()
  },

  toAudioDetail: function(e){
    wx.navigateTo({
      url: '../audioDetail/audioDetail?audioId=' + e.currentTarget.dataset.audio_id,
    })
  },

  onHide: function () {
    innerAudioContext.stop();
  },

  onUnload: function () {
    innerAudioContext.stop();
  },

})