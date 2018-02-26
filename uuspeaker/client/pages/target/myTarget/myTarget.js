var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var roomId = ''
Page({
  data: {
    userInfo: {},
    endDate: '',
    operation: 'add'
  },

  addUserTarget: function (e) {
    var requestData = e.detail.value
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.myTarget`,
      data: requestData,
      login: true,
      method: 'post',
      success(result) {
        util.showSuccess('目标制定成功')
        that.setData({
          applyResult: result.data.data
        })
        wx.navigateBack({
          
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  bindDateChange: function (e) {
    console.log(e)
    this.setData({
      endDate: e.detail.value
    })
  },

  onLoad: function(){
    var endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    this.setData({
      endDate: dateFormat.format(endDate, 'yyyy-MM-dd')
    })
  }

});