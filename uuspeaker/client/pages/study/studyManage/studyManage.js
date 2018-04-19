var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:''
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
      url: '../../article/myArticle/myArticle',
    })
  },

  toMyInfluence: function () {
    wx.navigateTo({
      url: '../../userInfo/myInfluence/myInfluence',
    })
  },

  toSpeechAudio: function () {
    wx.navigateTo({
      url: '../../impromptu/myAudio/myAudio',
    })
  },

  toMyTarget: function(){
    wx.navigateTo({
      url: '../../userInfo/myTargetDetail/myTargetDetail',
    })
  },

  toSpeechSubject: function () {
    wx.navigateTo({
      url: '../../speech/mySpeechSubject/mySpeechSubject',
    })
  },

  toMyIntroduction: function() {
    wx.navigateTo({
      url: '../../userInfo/myIntroduction/myIntroduction',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.initUserInfo();
  },

  
})