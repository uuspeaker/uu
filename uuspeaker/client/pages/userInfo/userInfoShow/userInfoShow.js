var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var likeUserId
const innerAudioContext = wx.createInnerAudioContext()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLikeUser: '',
    userInfo: {},
    userIntroduction:[]
    // nickName: '',
    // avatarurl:''
  },

  likeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: likeUserId},
      method: 'post',
      success(result) {
        util.showSuccess('已关注用户')
        that.setData({
          isLikeUser: 1
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  cancelLikeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: likeUserId },
      method: 'delete',
      success(result) {
        util.showSuccess('已取消关注')
        that.setData({
          isLikeUser: 0
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  isLikeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: likeUserId },
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

  getUserInfo: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.userBaseInfo`,
      login: true,
      data: { userId: likeUserId },
      method: 'get',
      success(result) {
        wx.hideLoading()
        console.log(result.data.data)
        that.setData({
          
          userInfo: result.data.data.userInfo,
          userIntroduction: result.data.data.userIntroduction
        })
        that.formatDateAndStatus()
        // if (result.data.data.userIntroduction.length > 0){
        //   that.playAudio()
        // }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  playAudio: function () {
    console.log('playAudio',this.data.userIntroduction[0].src)
    innerAudioContext.src = this.data.userIntroduction[0].src
    innerAudioContext.play()
    this.formatDateAndStatus(this.data.userIntroduction[0].src)
  },

  formatDateAndStatus: function (src) {
    var data = this.data.userIntroduction
    for (var i = 0; i < data.length; i++) {
      if (data[i].src == src) {
        data[i].isPlay = 1
      } else {
        data[i].isPlay = 0
      }
    }
    this.setData({
      userIntroduction: data
    })
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.stop()
    this.formatDateAndStatus()
  },

  toLikeUserList: function (e) {
    wx.navigateTo({
      url: '../../userInfo/likeUserList/likeUserList?userId=' + this.data.userInfo.userId + '&nickName=' + this.data.userInfo.nickName,
    })
  },

  toSpeechAudio: function (e) {
    wx.navigateTo({
      url: '../../impromptu/myAudio/myAudio?userId=' + this.data.userInfo.userId + '&nickName=' + this.data.userInfo.nickName,
    })
  },

  toMyInfluence: function () {
    wx.navigateTo({
      url: '../../userInfo/myInfluence/myInfluence?userId=' + this.data.userInfo.userId + '&nickName=' + this.data.userInfo.nickName,
    })
  },

  toStudyReportToday: function () {
    wx.navigateTo({
      url: '../../studyData/studyReportToday/studyReportToday?userId=' + this.data.userInfo.userId + '&nickName=' + this.data.userInfo.nickName,
    })
  },

  toStudyReport: function () {
    wx.navigateTo({
      url: '../../studyData/studyReportTotal/studyReportTotal?userId=' + this.data.userInfo.userId 
        + '&nickName=' + this.data.userInfo.nickName 
        + 'speechScoreTotal=' + this.data.speechScoreTotal
        + '&reviewScoreTotal=' + this.data.reviewScoreTotal
        + '&listenScoreTotal=' + this.data.listenScoreTotal
        + '&evaluateScoreTotal=' + this.data.evaluateScoreTotal,
    })
  },

  onLoad: function (options) {
    console.log(options)
    this.setData({
      roomId: options.roomId
    })

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      wx.hideLoading()
      console.log('开始播放', innerAudioContext.currentTime)
    })
    innerAudioContext.onWaiting(() => {
      wx.showLoading({
        title: '音频加载中',
      })
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


  onLoad: function (options) {
    console.log(options)
    likeUserId = options.userId
    // this.setData({
    //   nickName: options.nickName,
    //   userAvatar: options.avatarUrl
    // })
    this.isLikeUser()
    this.getUserInfo(options.userId)
  },

  onUnload: function () {
    innerAudioContext.stop();
  },


  
})