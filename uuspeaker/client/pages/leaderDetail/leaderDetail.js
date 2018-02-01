var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["影响会员"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    LeaderScoreData: {}

  },

  queryLeaderScore: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/leaderDetail`,
      login: true,
      method: 'get',
      success(result) {
        //util.showSuccess('请求成功完成')
        that.setData({
          LeaderScoreData: result.data.data
        })

        console.log(result.data.data)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

 
  onLoad: function () {
    this.queryLeaderScore()
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