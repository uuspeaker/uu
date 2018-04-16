var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var likeUserId
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLikeUser: '',
    userInfo: {}
    // nickName: '',
    // avatarurl:''
  },

  likeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: likeUserId},
      method: 'post',
      success(result) {
        util.showSuccess('已关注用户')
        that.setData({
          isLikeUser: 1
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  cancelLikeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: likeUserId },
      method: 'delete',
      success(result) {
        util.showSuccess('已取消关注')
        that.setData({
          isLikeUser: 0
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  isLikeUser: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUser`,
      login: true,
      data: { likeUserId: likeUserId },
      method: 'get',
      success(result) {
        that.setData({
          isLikeUser: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getUserInfo: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.userBaseInfo`,
      login: true,
      data: { userId: likeUserId },
      method: 'get',
      success(result) {
        that.setData({
          userInfo: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  onLoad: function (options) {
    console.log(options)
    likeUserId = options.userId
    // this.setData({
    //   nickName: options.nickName,
    //   userAvatar: options.avatarUrl
    // })
    this.isLikeUser()
    this.getUserInfo(options.userId)
  },

  

  
})