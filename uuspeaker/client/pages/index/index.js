var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')
Page({

  data: {
    userInfo: {},
    logged: false,
    userApplyList: {},
    totalScoreList: {},
    meetingScoreList: {},
    speakerScoreList: {},
    evaluatorScoreList: {},
    hostScoreList: {},
    reportScoreList: {},
    userScoreDates: {},

    imgUrls: [
      '../../images/member/Charles.jpg',
      '../../images/member/Nelson.jpg',
      '../../images/member/jiasen.jpg'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 4000,
    duration: 1000
  },

  // 用户登录示例
  login: function () {
    if (this.data.logged) {
      wx.navigateTo({
        url: '../index/index'
      })
      return
    }
    util.showBusy('正在登录')
    var that = this

    // 调用登录接口
    qcloud.login({
      success(result) {
        if (result) {
          util.showSuccess('登录成功')
          that.setData({
            userInfo: result,
            logged: true
          })
          setScore();
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          qcloud.request({
            url: config.service.requestUrl,
            login: true,
            success(result) {
              util.showSuccess('登录成功')
              that.setData({
                userInfo: result.data.data,
                logged: true
              })
            },

            fail(error) {
              util.showModel('请求失败', error)
              console.log('request fail', error)
            }
          })
        }
      },

      fail(error) {
        util.showModel('登录失败', error)
        console.log('登录失败', error)
      }
    })
    wx.navigateTo({
      url: '../index/index'
    })
  },

  selected: function (e) {
    this.setData({
      selected1: false,
      selected: true
    })
  },
  selected1: function (e) {
    this.setData({
      selected: false,
      selected1: true
    })
  },

  getScoreDetail: function () {
    util.showBusy('请求中...')
    var that = this
    var now = new Date()
    var meetingDate = dateFormat.getFormatDate(now, 'yyyyMMdd')
    qcloud.request({
      url: `${config.service.host}/weapp/meetingApplyInfo`,
      login: false,
      data: { 'meetingDate': meetingDate },
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          userApplyList: result.data.data.userApplyList,
          totalScoreList: result.data.data.totalScore,
          meetingScoreList: result.data.data.meetingScore,
          speakerScoreList: result.data.data.speakerScore,
          evaluatorScoreList: result.data.data.evaluatorScore,
          hostScoreList: result.data.data.hostScore,
          reportScoreList: result.data.data.reportScore,
          userScoreDates: result.data.data
        })

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },
  
  toMeetingApply: function(){
    wx.navigateTo({
      url: '../meetingApply/meetingApply'
    })
  },

  toScoreManage: function () {
    wx.navigateTo({
      url: '../scoreManage/scoreManage'
    })
  },

  onLoad: function () {
    this.getScoreDetail();

  },

  onShow: function(){
    this.onLoad()
  },

  
  
})