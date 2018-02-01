var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["学习总榜", "本月进步榜"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    userInfo: {},

    myStudyScore: 0,
    myStudyScoreRank: 0,
    myStudyIncreaseScore: 0,
    myStudyIncreaseScoreRank: 0,

    studyScore: {},
    studyIncreaseScore: {}
  },

  getScoreDetail:function() {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/studyRank`,
      login: true,
      success(result) {
        //util.showSuccess('请求成功完成')
        that.setData({
          studyScore: result.data.data.studyScore,
          studyIncreaseScore: result.data.data.studyIncreaseScore,
          myStudyScore: result.data.data.myStudyScore,
          myStudyScoreRank: result.data.data.myStudyScoreRank,
          myStudyIncreaseScore: result.data.data.myStudyIncreaseScore,
          myStudyIncreaseScoreRank: result.data.data.myStudyIncreaseScoreRank
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