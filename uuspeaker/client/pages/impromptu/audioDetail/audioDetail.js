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
    audioId: 'ef2316b0-2cbf-11e8-aaad-b14a08eb0823',
    audioDataLike: [],
    audios:[],
    audioDataLike:[],
    audioDataComment:[]
  },

  //查询最新房间信息
  queryAudioDetail: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.audioDetail`,
      login: true,
      method: 'get',
      data: { audioId: this.data.audioId },
      success(result) {
        console.log(result)
        that.setData({
          audios: result.data.data.audioData,
          audioDataLike: result.data.data.audioDataLike,
          audioDataComment: result.data.data.audioDataComment
        })
        that.formatDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDateAndStatus: function (src) {
    var audios = this.doFormatDateAndStatus(this.data.audios,src)
    var audioDataLike = this.doFormatDateAndStatus(this.data.audioDataLike, src)
    var audioDataComment = this.doFormatDateAndStatus(this.data.audioDataComment, src)
    this.setData({
      audios: audios,
      audioDataLike: audioDataLike,
      audioDataComment: audioDataComment
    })
  },

  doFormatDateAndStatus: function(data,src){
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
    return data
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

  playAudio: function (e) {
    
    this.updateViewAndLikeTimes(e)
  },

  updateViewAmount: function (audioId, viewType) {
    var data = this.data.audios
    for (var i = 0; i < data.length; i++) {
      if (data[i].audio_id == audioId && viewType == 'view') {
        data[i].view_amount = data[i].view_amount + 1
      }
      if (data[i].audio_id == audioId && viewType == 'like') {
        data[i].like_amount = data[i].like_amount + 1
      }

    }
    this.setData({
      audios: data
    })
  },

  updateViewAndLikeTimes: function (e) {
    var src = e.currentTarget.dataset.src
    var audioId = e.currentTarget.dataset.audio_id
    innerAudioContext.autoplay = true
    innerAudioContext.src = src
    this.formatDateAndStatus(src)

    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      method: 'put',
      data: { audioId: audioId, viewType: 'view' },
      success(result) {
        that.updateViewAmount(audioId, 'view')
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  likeIt: function (e) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      method: 'put',
      data: { audioId: e.currentTarget.dataset.audio_id, viewType: 'like' },
      success(result) {
        that.updateViewAmount(e.currentTarget.dataset.audio_id, 'like')
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
    console.log(options)
    this.setData({
      audioId: options.audioId
    })
    this.queryAudioDetail()

    innerAudioContext.onPlay(() => {
      console.log('开始播放', innerAudioContext.currentTime)
      this.showLikeUser()
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

})