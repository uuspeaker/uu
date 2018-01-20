var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')

Page({
  data: {
    methodName: '',
    queryUserId: 'AA',
    meetingData: {},
    meetingTime: {},
    roleType: {},
    meetingDate: dateFormat.getFormatDate(new Date(), 'yyyyMMdd'),
    applyResult: {}
  },


  applySpeaker: function(e){
    var methodName = e.detail.target.dataset.action
    
    console.log(e.detail.target.dataset.action)
    util.showBusy('请求中...')
    var that = this
    e.detail.value['meetingDate'] = this.data.meetingDate
    console.log(e.detail.value)
    qcloud.request({
      url: `${config.service.host}/weapp/meetingApply`,
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

  

  onLoad1: function () {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/meetingApply`,
      data: { 'userId': this.data.queryUserId},
      method: 'get',
      login: false,
      success(result) {
        util.showSuccess('请求成功完成')
        console.log(result.data.data)
        that.setData({
          applyResult: result.data.data,
          meetingData: result.data.data[0].meeting_data,
          meetingTime: result.data.data[0].meeting_time,
          roleType: result.data.data[0].role_type

        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onShow: function(){

  }

})

