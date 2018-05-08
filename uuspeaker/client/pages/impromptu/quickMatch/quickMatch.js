var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var getlogininfo = require('../../../getlogininfo.js')

var roomId = ''
var getMatchInfoId = ''
var waitId = ''
var enterIntervalId = ''
var userId = ''
var searchSeconds = 30
var hasEnter = 0
var tryTimes = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitSeconds: '',
    isMatching: 0,
    onlineUser: []
  },

  enterMatchRoom: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.onlineUser`,
      login: true,
      method: 'post',
      success(result) {
        that.setData({
          onlineUser: result.data.data
        })

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },
  leaveMatchRoom: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.onlineUser`,
      login: true,
      method: 'put',
      success(result) {

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  startMatch: function () {
    util.showSuccess('开始匹配')
    this.setData({
      waitSeconds: 1,
      isMatching: 1
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickMatch`,
      login: true,
      method: 'post',
      success(result) {
        console.log('userId', result.data.data)
        userId = result.data.data
        getMatchInfoId = setInterval(that.getMatchInfo, 1000)
        //that.getMatchInfo()
        waitId = setInterval(that.wait, 1000)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  stopMatch: function () {
    clearInterval(getMatchInfoId)
    clearInterval(waitId)
    this.setData({
      waitSeconds: 0,
      isMatching: 0
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickMatch`,
      login: true,
      method: 'put',
      success(result) {

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  wait: function () {
    this.setData({
      waitSeconds: this.data.waitSeconds + 1
    })
    if (this.data.waitSeconds >= searchSeconds) {
      clearInterval(getMatchInfoId)
      clearInterval(waitId)
      util.showSuccess('未找到匹配用户')
      this.setData({
        waitSeconds: 0,
        isMatching: 0
      })
    }
  },

  getMatchInfo: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickMatch`,
      login: true,
      method: 'get',
      data: { 'userId': userId },
      success(result) {
        console.log('getMatchInfo', result.data.data)
        var userInfo = result.data.data
        if (userInfo == 0) {
          //util.showBusy('搜索中...')
        } else {
          clearInterval(getMatchInfoId)
          clearInterval(waitId)
          util.showSuccess('匹配成功')
          console.log('userInfo', userInfo)
          //setTimeout(that.createAndGoRoom, Math.random() * 5, userInfo)
          //Math.floor(Math.random() * 3)
          that.doGoRoom(userInfo)
        }

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  // 进入rtcroom页面
  doGoRoom: function (userInfo) {
    var url = '../quickMatchRoom/quickMatchRoom?roomId=' + userInfo.roomId + '&userId=' + userId + '&nickName=' + userInfo.matchedUser.nickName + '&avatarUrl=' + userInfo.matchedUser.avatarUrl + '&speechName=' + userInfo.speechName
      console.log(url)
      wx.navigateTo({
        url: url
      });
  },

  createAndGoRoom: function (roomId) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否准备就绪？',
      success: function (sm) {
        if (sm.confirm) {
          that.doGoRoom()
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  onHide: function () {
    this.leaveMatchRoom()
    if (this.data.isMatching == 1) {
      this.stopMatch()
    } else {
      this.leaveMatchRoom()
    }

  },

  onUnload: function () {
    this.leaveMatchRoom()
    if (this.data.isMatching == 1) {
      this.stopMatch()
    } else {
      this.leaveMatchRoom()
    }
  },

})