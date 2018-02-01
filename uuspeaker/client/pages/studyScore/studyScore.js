var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    //tab页数据
    tabs: ["1、积分", "2、复盘", "3、打卡"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    //积分tab页数据
    userInfo: {},
    dateArray: ['今天', '昨天', '前天',],
    dateValue: [0, 1, 2],
    timeArray: ['20:00', '20:30', '21:00', '21:30', '22:00'],
    timeValue: [2000, 2030, 2100, 2130, 2200],
    dateIndex: 0,
    timeIndex: 1
    //打卡tab页数据
    
  },

  studyScore: function (e) {
    console.log(e.detail.value)
    util.showBusy('请求中...')
    var that = this
    var requestData = e.detail.value
    var now = new Date()
    var meetingDateMinus = this.data.dateValue[this.data.dateIndex]
    now.setDate(now.getDate() - meetingDateMinus)
    requestData.meetingDate = dateFormat.format(now, 'yyyyMMdd')
    requestData.meetingTime = this.data.timeValue[this.data.timeIndex]
    console.log(requestData)
    qcloud.request({
      url: `${config.service.host}/weapp/studyScore`,
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

  studyDuration: function (e) {
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
      login: true,
      method: 'post',
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          applyResult: result.data.data
        })
        wx.navigateTo({
          url: '../studyShow/studyShow',
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
    
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
      url: `${config.service.host}/weapp/studyReport`,
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

  toStudyDurationDetail: function(){
    wx.navigateTo({
      url: '../studyDurationDetail',
    })
  },

  toStudyScoreDetail: function () {
    wx.navigateTo({
      url: '../studyScoreDetail',
    })
  },

  onLoad: function () {

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  }
});