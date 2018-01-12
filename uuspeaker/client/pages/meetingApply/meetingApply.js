var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    methodName: 'post'
  },


  applySpeaker: function(e){
    //console.log(e)
    var methodName = e.detail.target.dataset.action
    console.log(e.detail.target.dataset.action)
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/meetingManage`,
      data: e.detail.value,
      method: methodName,
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
    
  }

})

