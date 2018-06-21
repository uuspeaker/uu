var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var userInfo = require('../../../common/userInfo.js')
//查询标记(1-查自己;2-查所有;3-查最赞)
var clubId = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyList: {}
  },



  //查询排名信息
  queryApplyList: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubApply`,
      login: true,
      method: 'get',
      data: { clubId: clubId, queryType:2},
      success(result) {
        wx.hideLoading()
        that.setData({
          applyList: result.data.data
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
    var data = this.data.applyList
    for (var i = 0; i < data.length; i++) {
      data[i].score = Math.floor((data[i].totalDuration + 59) / 60)
      data[i].level = userInfo.getRank(data[i].totalDuration)
    }
    this.setData({
      applyList: data
    })
  },

  pass: function (e) {
    var userId = e.currentTarget.dataset.user_id
    this.checkApply(userId, 1)
  },

  deny: function (e) {
    var userId = e.currentTarget.dataset.user_id
    wx.showModal({
      title: '提示',
      content: '是否确定拒绝？',
      success: (sm) => {
        if (sm.confirm) {
          this.checkApply(userId, 2)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //查询排名信息
  checkApply: function (userId, operationType) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubApply`,
      login: true,
      method: 'put',
      data: { clubId: clubId, userId: userId, operationType: operationType},
      success(result) {
        util.showSuccess('操作成功')
        console.log(result.data.data)
        that.queryApplyList()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id + '&nickName=' + e.currentTarget.dataset.nick_name + '&avatarUrl=' + e.currentTarget.dataset.avatar_url,
    })
  },

  onLoad: function (options) {
    clubId = options.clubId
    this.queryApplyList()
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '入会申请' });
  },


})