var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    scoreDetail: {},
  },

  getScoreDetail: function () {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/scoreDetail`,
      login: false,
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          scoreDetail: result.data.data.scoreDetail
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function(){
    this.getScoreDetail();
    console.log(JSON.stringify(this.scoreDetail))
  }
 
})

