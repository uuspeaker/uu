var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {

  },

  
  studyReport: function (e) {
    console.log(e.detail.value)
    util.showBusy('请求中...')
    var that = this
    var requestData = e.detail.value
    // var now = new Date()
    // var studyDateMinus = this.data.dateValue[this.data.dateIndex]
    // now.setDate(now.getDate() - studyDateMinus)
    // requestData.studyDate = dateFormat.format(now, 'yyyyMMdd')
    console.log(requestData)
    qcloud.request({
      url: `${config.service.host}/weapp/myReport`,
      data: requestData,
      login: true,
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

  },

});