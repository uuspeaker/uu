var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["影响总榜", "本月进步榜"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    userInfo: {},

    myLeaderScore: 0,
    myLeaderScoreRank: 0,
    myLeaderIncreaseScore: 0,
    myLeaderIncreaseScoreRank: 0,

    totalScore: {},
    increaseScore: {},
    leaderScore: {}
  },

  getScoreDetail: function () {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/leaderRank`,
      login: false,
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          leaderScore: result.data.data.leaderScore,
          leaderIncreaseScore: result.data.data.leaderIncreaseScore,
          myLeaderScore: result.data.data.myLeaderScore,
          myLeaderScoreRank: result.data.data.myLeaderScoreRank,
          myLeaderIncreaseScore: result.data.data.myLeaderIncreaseScore,
          myLeaderIncreaseScoreRank: result.data.data.myLeaderIncreaseScoreRank
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  initUserInfo: function () {
    var that = this
    wx.getUserInfo({
      withCredentials: false,
      lang: '',
      success(result) {
        that.setData({
          userInfo: result.userInfo
        })
      },
      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      },
      complete: function (res) {

      },
    })
  },  

  onLoad: function () {
    this.getScoreDetail()
    this.initUserInfo()
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