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
        that.setData({
          userInfo: result.data.data.userInfo,
          userIntroduction: result.data.data.userIntroduction
        })
        that.formatDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  playAudio: function (e) {
    //this.queryAudioLikeUser(e)
    this.updateViewTimes(e)
  },

  updateViewTimes: function (e) {
    var src = e.currentTarget.dataset.src
    var audioId = e.currentTarget.dataset.audio_id
    innerAudioContext.autoplay = true
    innerAudioContext.src = src
    this.formatDateAndStatus(src)

    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioView`,
      login: true,
      method: 'post',
      data: { audioId: audioId },
      success(result) {
        //that.updateViewAmount(audioId)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
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

  

  
})