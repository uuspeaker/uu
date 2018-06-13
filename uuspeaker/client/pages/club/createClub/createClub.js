var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

Page({
  data: {
    userInfo: {},
  },

  createClub: function (e) {
    util.showBusy('请求中...')
    var requestData = e.detail.value
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubInfo`,
      data: requestData,
      login: true,
      method: 'post',
      success(result) {
        util.showSuccess('俱乐部创建成功')
        that.setData({
          applyResult: result.data.data
        })
        that.toClubList()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  toClubList: function () {
    wx.navigateTo({
      url: '../../club/clubList/clubList',
    })
  },

  initUserInfo: function () {
    var that = this
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success(result) {
        that.setData({
          userInfo: result.data.data,
        })
      },

      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      }
    })

  },

  onLoad: function (options) {
    console.log(options)
    this.initUserInfo()
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '创建俱乐部' });
  },

});