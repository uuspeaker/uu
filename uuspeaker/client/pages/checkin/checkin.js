var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')

Page({
  data: {
    userInfo: {},
    dateArray: ['今天', '昨天', '前天',],
    dateValue: [0, 1, 2],
    timeArray: ['20:00', '20:30', '21:00', '21:30', '22:00'],
    timeValue: [2000, 2030,2100,2130,2200],
    dateIndex: 0,
    timeIndex: 1

  },

  scoreManage: function (e) {
    console.log(e.detail.value)
    util.showBusy('请求中...')
    var that = this
    var requestData = e.detail.value
    var now = new Date()
    var meetingDateMinus = this.data.dateValue[this.data.dateIndex]
    now.setDate(now.getDate() - meetingDateMinus)
    requestData.meetingDate = dateFormat.getFormatDate(now, 'yyyyMMdd')
    requestData.meetingTime = this.data.timeValue[this.data.timeIndex]
    qcloud.request({
      url: `${config.service.host}/weapp/checkin`,
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

  onLoad: function (options) {
    var that = this
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          userInfo: res.userInfo
        })
      }
    })
    // var that = this
    // wx.getStorage({
    //   key: 'userInfo',
    //   success: function (res) {
    //     console.log(res)
    //     that.setData({
    //       userInfo: res.data
    //     })
        
    //   }
    // })
  },


})

