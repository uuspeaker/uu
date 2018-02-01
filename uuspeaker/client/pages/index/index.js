var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')
Page({

  data: {
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
    var meetingDate = dateFormat.format(now, 'yyyyMMdd')
    qcloud.request({
      url: `${config.service.host}/weapp/meetingApplyInfo`,
      login: true,
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