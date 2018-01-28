var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["学习力", "本月增长"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    studyScore: {},
    studyIncreaseScore: {}
  },

  getScoreDetail:function() {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/studyRank`,
      login: false,
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          studyScore: result.data.data.studyScore,
          studyIncreaseScore: result.data.data.studyIncreaseScore
        })
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })

  },

  onLoad: function () {
    this.getScoreDetail()
    
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