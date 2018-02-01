var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')
var session = require('../../vendor/wafer2-client-sdk/lib/session.js');

Page({
  data: {
    userInfo: {},
    dateArray: ['今天', '昨天', '前天',],
    dateValue: [0, 1, 2],
    dateIndex: 0

  },

  scoreManage: function (e) {
    console.log(e.detail.value)
    util.showBusy('请求中...')
    var that = this
    var requestData = e.detail.value
    var now = new Date()
    var studyDateMinus = this.data.dateValue[this.data.dateIndex]
    now.setDate(now.getDate() - studyDateMinus)
    requestData.studyDate = dateFormat.format(now, 'yyyyMMdd')
    //requestData.skey = session.get()
    console.log(requestData)
    qcloud.request({
      url: `${config.service.host}/weapp/studyDuration`,
      data: requestData,
      login: false,
      method: 'post',
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
    wx.reLaunch({
      url: '../studyShow/studyShow'
    })
  },
  bindDateChange: function (e) {
    this.setData({
      dateIndex: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      timeIndex: e.detail.value
    })
  },


})

