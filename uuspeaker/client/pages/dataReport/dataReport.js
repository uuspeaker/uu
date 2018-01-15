var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    dataReport: {},
    totalScore: 1
    //studyRate: dataReport.studyUserAmount / dataReport.totalUserAmount,
    //reportRate: dataReport.reportCount / dataReport.studyAmount
  },

  queryUserScore: function (e) {
    util.showBusy('请求中...')
    var that = this
    var query = wx.createSelectorQuery()
    //var userId = this.inputContent['userId']
    qcloud.request({
      url: `${config.service.host}/weapp/dataReport`,
      login: false,
      //method: 'get',
      data: e.detail.value,
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          dataReport: result.data.data,
          totalScore: result.data.data.totalUserAmount[0].length
        })

        console.log(result.data.data)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  }

})

