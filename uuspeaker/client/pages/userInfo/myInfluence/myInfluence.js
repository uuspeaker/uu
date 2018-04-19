var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    userTotal: 0,
    userList: [],
    userId: '',
    nickName: ''
  },

  //查询自由练习任务信息
  queryInfluenceInfo: function () {
    //util.showBusy('请求中...')
    var queryData = { userId: this.data.userId }
    console.log('queryData', queryData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.myInfluenceList`,
      login: true,
      method: 'get',
      data: queryData,
      success(result) {
        that.setData({
          userList: result.data.data.userList,
          userTotal: Math.floor((result.data.data.userTotal+59)/60),
        })
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
    if (options.userId == undefined) {

    } else {
      this.setData({
        userId: options.userId,
        nickName: options.nickName
      })
    }
  },

  onShow: function () {
    this.queryInfluenceInfo()
  },

})