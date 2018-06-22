var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var method = 'post'
Page({
  data: {
    userInfo: {},
    clubId: '',
    clubName: '',
    clubDescription: '',
  },

  createClub: function (e) {
    util.showBusy('请求中...')
    var requestData = e.detail.value
    requestData.clubId = this.data.clubId
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubInfo`,
      data: requestData,
      login: true,
      method: method,
      success(result) {
        if (result.data.data == 1){
          util.showSuccess('俱乐部创建成功')
          that.toMyClub()
        }
        if (result.data.data == 2){
          util.showSuccess('俱乐部修改成功')
          that.toMyClub()
        }
        if (result.data.data == 9) {
          util.showSuccess('已经拥有俱乐部')
        }
        
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

  toMyClub: function () {
    wx.redirectTo({
      url: '../../club/myClub/myClub',
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
    if (options.operationType = 2){
      method = 'put'
      this.setData({
        clubId: options.clubId,
        clubName: options.clubName,
        clubDescription: options.clubDescription,
      })
    }
    this.initUserInfo()
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '创建俱乐部' });
  },

});