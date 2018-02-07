var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')

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
  queryMeetingUser: function (data) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuMeeting`,
      login: true,
      data: data,
      method: 'get',
      success(result) {
        //util.showSuccess('请求成功完成')
        that.setData({
          scoreData: result.data.data,
          totalScore: result.data.data.hostTotalScore
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

  toStudyScore: function () {
    wx.navigateTo({
      url: '../studyScore/studyScore',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.initUserInfo();
    this.queryMeetingUser(options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})