var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scoreData: {},
    userInfo: {},
    totalScore: 0
  },

  //查询用户参会数据
  queryUserScore: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/studyManage`,
      login: true,
      method: 'get',
      success(result) {
        console.log(result.data.data)
        //util.showSuccess('请求成功完成')
        that.setData({
          scoreData: result.data.data,
          totalScore: result.data.data.totalScore
        })
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

  toStudyScore: function(){
    wx.navigateTo({
      url: '../studyScore/studyScore',
    })
  },

  toRepireStudyScore: function () {
    wx.navigateTo({
      url: '../scoreManage/scoreManage',
    })
  },

  toStudyDetail: function () {
    wx.navigateTo({
      url: '../studyDetail/studyDetail',
    })
  },

  toReportDetail: function () {
    wx.navigateTo({
      url: '../myReport/myReport',
    })
  },

  toLeaderDetail: function () {
    wx.navigateTo({
      url: '../leaderDetail/leaderDetail',
    })
  },

  toSpeechAudio: function () {
    wx.navigateTo({
      url: '../impromptu/myAudio/myAudio',
    })
  },

  toMyTarget: function(){
    wx.navigateTo({
      url: '../target/myTargetDetail/myTargetDetail',
    })
  },

  toSpeechSubject: function () {
    wx.navigateTo({
      url: '../speech/mySpeechSubject/mySpeechSubject',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initUserInfo();
    this.queryUserScore();
  },

  
})