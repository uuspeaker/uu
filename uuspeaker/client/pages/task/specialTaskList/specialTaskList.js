var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

const innerAudioContext = wx.createInnerAudioContext()
var showTimes = 0
//查询标记(1-查自己;2-查所有;3-查最赞)
var queryUserType = ''

//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''

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

  //查询自由练习任务信息
  queryMySpecialTask: function () {
    if (queryUserType == 1)return
    queryUserType = 1
    queryPageType = 0
    this.setData({
      audios: []
    })
    this.doQuerySpecialTask(queryUserType)
  },

  queryNewSpecialTask: function () {
    if (queryUserType == 2) return
    queryUserType = 2
    queryPageType = 0
    this.setData({
      audios: []
    })
    this.doQuerySpecialTask(queryUserType)
  },

  queryHotSpecialTask: function () {
    if (queryUserType == 3) return
    queryUserType = 3
    queryPageType = 0
    this.setData({
      audios: []
    })
    this.doQuerySpecialTask(queryUserType)
  },

  //查询自由练习任务信息
  doQuerySpecialTask: function (queryUserType) {
    //util.showBusy('请求中...')
    var queryData = { 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime, queryUserType: queryUserType  }
    console.log('queryData',queryData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.specialTask`,
      login: true,
      method: 'get',
      data: queryData,
      success(result) {
        console.log(result)
        if (result.data.data == ''){
          util.showSuccess('没有更多记录')
          return
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
        that.formatDateAndStatus()
        //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
        that.refreshDataId()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshDataId: function () {
    var length = this.data.audios.length
    firstDataTime = this.data.audios[0].create_date
    lastDataTime = this.data.audios[length - 1].create_date
  },

  //查询点赞用户信息
  queryAudioLikeUser: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.likeAudio`,
      login: true,
      method: 'get',
      data: { audioId: e.currentTarget.dataset.audio_id },
      success(result) {
        console.log(result)
        that.setData({
          audioLikeUser: result.data.data
        })
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
    this.queryAudioLikeUser(e)
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

  onShow: function () {
    queryPageType = 0
    queryUserType = 1
    this.doQuerySpecialTask(queryUserType)
  },

  onPullDownRefresh: function () {
    queryPageType = 1
    this.doQuerySpecialTask(queryUserType)
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.doQuerySpecialTask(queryUserType)
  },


  toAudioDetail: function (e) {
    wx.navigateTo({
      url: '../../impromptu/audioDetail/audioDetail?audioId=' + e.currentTarget.dataset.audio_id,
    })
  },

  toAllSpecialTask: function (e) {
    wx.navigateTo({
      url: '../allSpecialTask/allSpecialTask' 
    })
  },

  toDoSpecialTask: function(e) {
    wx.navigateTo({
      url: '../doSpecialTask/doSpecialTask?'
    })
  },

})