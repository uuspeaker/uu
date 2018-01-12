var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    userApplyList: {},
    totalScoreList: {},
    meetingScoreList: {},
    speakerScoreList: {},
    evaluatorScoreList: {},
    hostScoreList: {},
    reportScoreList: {},
    userScoreDates: {}
  },

  getScoreDetail: function () {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/meetingApplyInfo`,
      
      login: false,
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

  applySpeaker: function(e){
    console.log(e.detail.value)
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/meetingManage`,
      data: e.detail.value,
      method: 'POST',
      login: false,
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          applyResult: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function () {
    this.getScoreDetail();
    console.log(JSON.stringify(this.scoreDetail))
  }

})

