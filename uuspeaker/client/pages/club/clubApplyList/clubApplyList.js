var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')
var userInfo = require('../../../common/userInfo.js')
//查询标记(1-查自己;2-查所有;3-查最赞)
var clubId = ''
const innerAudioContext = wx.createInnerAudioContext()
var currentAudioIndex = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyList: {},
    myRole: 0
  },



  //查询排名信息
  queryApplyList: function () {
    // wx.showLoading({
    //   title: '加载中',
    // })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubApply`,
      login: true,
      method: 'get',
      data: { clubId: clubId, queryType:2},
      success(result) {
        wx.hideLoading()
        that.setData({
          applyList: result.data.data
        })
        that.formatDateAndStatus()
        that.initDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDateAndStatus: function () {
    var data = this.data.applyList
    for (var i = 0; i < data.length; i++) {
      data[i].score = Math.floor((data[i].totalDuration + 59) / 60)
      data[i].level = userInfo.getRank(data[i].totalDuration)
    }
    this.setData({
      applyList: data
    })
  },

  playAudio: function (e) {
    var data = this.data.applyList
    //播放音频时将前一个播放的音频置为暂停
    if (currentAudioIndex != '') {
      this.data.applyList[currentAudioIndex].isPlay = 0
    }

    currentAudioIndex = e.currentTarget.dataset.index
    if (!(data[currentAudioIndex].time_duration > 0)) return
    var src = data[currentAudioIndex].src
    var audioId = data[currentAudioIndex].audio_id
    var currentDuration = data[currentAudioIndex].current_duration
    innerAudioContext.src = src
    innerAudioContext.seek(currentDuration)
    innerAudioContext.play()

    data[currentAudioIndex].isPlay = 1
    this.setData({
      applyList: data
    })

  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.pause()
    this.data.applyList[currentAudioIndex].isPlay = 0
    this.setData({
      applyList: this.data.applyList
    })
  },

  changeSlider: function (e) {
    if (e.currentTarget.dataset.play == 0) return
    innerAudioContext.seek(innerAudioContext.duration * e.detail.value / 100)
  },

  initDateAndStatus: function () {
    var data = this.data.applyList
    console.log('initDateAndStatus', data)
    for (var i = 0; i < data.length; i++) {
      console.log(i)
      var now = new Date()
      data[i].createDateStr = dateFormat.getSimpleFormatDate(data[i].create_date)
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      data[i].isPlay = 0
      data[i].timeDuration = data[i].time_duration
      data[i].currentDuration = 0
      data[i].sliderValue = 0
      data[i].currentTime = '00:00'
      data[i].duration = dateFormat.getFormatTimeForAudio(Math.floor(data[i].time_duration))
      data[i].audioIndex = i
      data[i].myRole = this.data.myRole
    }
    this.setData({
      applyList: data
    })
  },

  pass: function (e) {
    var userId = e.currentTarget.dataset.user_id
    this.checkApply(userId, 1)
  },

  deny: function (e) {
    var userId = e.currentTarget.dataset.user_id
    wx.showModal({
      title: '提示',
      content: '是否确定拒绝？',
      success: (sm) => {
        if (sm.confirm) {
          this.checkApply(userId, 2)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //查询排名信息
  checkApply: function (userId, operationType) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubApply`,
      login: true,
      method: 'put',
      data: { clubId: clubId, userId: userId, operationType: operationType},
      success(result) {
        util.showSuccess('操作成功')
        console.log(result.data.data)
        that.queryApplyList()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id + '&nickName=' + e.currentTarget.dataset.nick_name + '&avatarUrl=' + e.currentTarget.dataset.avatar_url,
    })
  },

  onLoad: function (options) {
    clubId = options.clubId
    this.setData({
      myRole: options.myRole
    })
    this.queryApplyList()

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
      var data = this.data.applyList
      if (innerAudioContext.src == audioService.getSrc()) return
      data[currentAudioIndex].sliderValue = (100 * innerAudioContext.currentTime / innerAudioContext.duration)
      data[currentAudioIndex].currentTime = dateFormat.getFormatTimeForAudio(Math.floor(innerAudioContext.currentTime))
      data[currentAudioIndex].currentDuration = Math.floor(innerAudioContext.currentTime)
      this.setData({
        applyList: data
      })
    })

    innerAudioContext.onEnded((res) => {
      var data = this.data.applyList
      //audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      data[currentAudioIndex].sliderValue = 0
      data[currentAudioIndex].currentTime = '00:00'
      data[currentAudioIndex].currentDuration = 0
      data[currentAudioIndex].isPlay = 0
      this.setData({
        applyList: data
      })

    })
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '入会申请' });
  },


})