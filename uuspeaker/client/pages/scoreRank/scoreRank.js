var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    totalScore: {},
    meetingScore: {},
    speakerScore: {},
    evaluatorScore: {},
    hostScore: {},
    reportScore: {}
  },

  getScoreDetail: function () {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/scoreRank`,
      login: false,
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          totalScore: result.data.data.totalScore,
          meetingScore: result.data.data.meetingScore,
          speakerScore: result.data.data.speakerScore,
          evaluatorScore: result.data.data.evaluatorScore,
          hostScore: result.data.data.hostScore,
          reportScore: result.data.data.reportScore
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

