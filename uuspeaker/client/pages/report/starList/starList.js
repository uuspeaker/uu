var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var userInfo = require('../../../common/userInfo.js')
var dateFormat = require('../../../common/dateFormat.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    starList: {},
  },


  //查询排名信息
  doQueryStudyRank: function (scoreType) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/report.starInfo`,
      login: true,
      method: 'get',
      success(result) {
        wx.hideLoading()
        console.log(result)
        if (result.data.data == '') {
          util.showSuccess('没有记录')
          return
        }
        that.setData({
          starList: result.data.data
        })
        that.formatDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDateAndStatus: function () {
    var data = this.data.starList
    for (var i = 0; i < data.length; i++) {
      var formatDateStr = data[i].study_date.substr(0, 4) + '/' + data[i].study_date.substr(4, 2) + '/' + data[i].study_date.substr(6, 2) + ' 00:00:00'
      console.log(formatDateStr)
      data[i].studyDateStr = dateFormat.format(new Date(formatDateStr),'yyyy年M月d日')
    }
    this.setData({
      starList: data
    })
  },

  onLoad: function (options) {
    this.doQueryStudyRank()
  },

  onShareAppMessage: function (res) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },


})