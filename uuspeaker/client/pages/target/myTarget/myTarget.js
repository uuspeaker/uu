var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var roomId = ''
var lastDays= [7,30,90,365]
Page({
  data: {
    todayStarAmount: 0,
    userTarget: [],
    studyDurationStr:'',

    studyDuration: '',
    starAmount: '',
    leftDays: '',
    userItems: [
      { 'name': '一个星期', 'value': '0' },
      { 'name': '一个月', 'value': '1' },
      { 'name': '三个月', 'value': '2' },
      { 'name': '一年', 'value': '3' },
    ]

  },

  getMyTarget: function (e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.userTarget`,
      login: true,
      method: 'get',
      success(result) {
        wx.hideLoading()
        that.setData({
          userTarget: result.data.data
        })

        if (result.data.data.length > 0){
          var userItems = that.data.userItems;
          for (var i = 0, len = userItems.length; i < len; ++i) {
            userItems[i].value == result.data.data[0].study_duration;
            that.setData({
              studyDurationStr: userItems[i].name
            });
          }
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getCurrentTargetProgress: function (e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.currentTargetProgress`,
      login: true,
      method: 'get',
      success(result) {
        wx.hideLoading()
        that.setData({
          userTarget: result.data.data
        })

        if (result.data.data.hasTarget == 1){
          var userItems = that.data.userItems;
            that.setData({
              studyDurationStr: userItems[result.data.data.targetStarDuration].name,
              leftDays: parseInt(lastDays[result.data.data.targetStarDuration], 10) - parseInt(result.data.data.currentLastDays)
            });
          
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);

    var userItems = this.data.userItems;
    for (var i = 0, len = userItems.length; i < len; ++i) {
      userItems[i].checked = userItems[i].value == e.detail.value;
      this.setData({
        studyDuration: userItems[i].value
      });
    }

    this.setData({
      userItems: userItems
    });
  },

  evaluate: function (e) {
    this.setData({
      starAmount: e.currentTarget.dataset.star
    })
  },

  saveTarget: function (e) {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.userTarget`,
      data: { 'studyDuration': this.data.studyDuration, 'starAmount': this.data.starAmount },
      login: true,
      method: 'post',
      success(result) {
        util.showSuccess('目标制定成功')
        wx.navigateBack({

        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function () {
    this.getCurrentTargetProgress()
    //this.getMyTarget()
  },


});