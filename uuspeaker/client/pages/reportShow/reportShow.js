var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    studyReportData: {}
  },

  queryStudyReport: function (e) {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/reportShow`,
      login: true,
      method: 'get',
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          studyReportData: result.data.data
        })

        console.log(result.data.data)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function () {
    this.queryStudyReport()
  },

});