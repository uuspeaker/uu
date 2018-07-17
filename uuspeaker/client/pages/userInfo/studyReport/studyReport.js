var wxCharts = require('../../../utils/wxcharts.js');
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var userInfo = require('../../../common/userInfo.js')

Page({
  data: {
    chartTitle: '近期学习情况',
    isMainChartDisplay: true,
    userScore:[],
    userId: '',
    nickName: '',

    totalStudyInfo: [],
    speechScoreTotal: 0,
    reviewScoreTotal: 0,
    listenScoreTotal: 0,
    evaluateScoreTotal: 0,
    totalStudyDuration: 0,
    todayStudyInfo: [],
    speechScoreToday: 0,
    reviewScoreToday: 0,
    listenScoreToday: 0,
    evaluateScoreToday: 0,
    todayStudyDuration: 0,
  },

  //查询排名信息
  queryLatestScore: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.studyReport`,
      login: true,
      method: 'get',
      data: {'userId': this.data.userId},
      success(result) {
        wx.hideLoading()
        that.setData({
          userScore: result.data.data
        })
        var length = result.data.data.length
        var dateArray = []
        var scoreArray = []
        for (var i = 0; i < length;i++){
          var studyDate = result.data.data[i].study_date
          var dateStr = studyDate.substr(0, 4) + '/' + studyDate.substr(4, 2) + '/' + studyDate.substr(6, 2) + ' 00:00:00'
          console.log(dateStr)
          dateArray.push(dateFormat.format(new Date(studyDate.substr(0, 4) + '/' + studyDate.substr(4, 2) + '/' + studyDate.substr(6, 2)  + ' 00:00:00'), 'M月d日'))
          scoreArray.push(Math.floor((result.data.data[i].totalDuration + 59) / 60),)
        }
        dateArray.reverse()
        scoreArray.reverse()
        that.showLatestScore(dateArray, scoreArray)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //查询学习力积分
  queryUserScore: function (e) {
    // wx.showLoading({
    //   title: '加载中',
    // })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.userScore`,
      login: true,
      method: 'get',
      data: { 'userId': this.data.userId },
      success(result) {
        //wx.hideLoading()
        that.setData({
          rank: userInfo.getRank(Math.floor(that.getDuration(result.data.data.totalStudyInfo))),
          totalStudyInfo: result.data.data.totalStudyInfo,
          speechScoreTotal: that.getScore(result.data.data.totalStudyInfo, 1),
          reviewScoreTotal: that.getScore(result.data.data.totalStudyInfo, 2),
          listenScoreTotal: that.getScore(result.data.data.totalStudyInfo, 3),
          evaluateScoreTotal: that.getScore(result.data.data.totalStudyInfo, 4),
          totalStudyDuration: Math.floor((that.getDuration(result.data.data.totalStudyInfo) + 59) / 60),
          todayStudyInfo: result.data.data.todayStudyInfo,
          speechScoreToday: that.getScore(result.data.data.todayStudyInfo, 1),
          reviewScoreToday: that.getScore(result.data.data.todayStudyInfo, 2),
          listenScoreToday: that.getScore(result.data.data.todayStudyInfo, 3),
          evaluateScoreToday: that.getScore(result.data.data.todayStudyInfo, 4),
          todayStudyDuration: Math.floor((that.getDuration(result.data.data.todayStudyInfo) + 59) / 60),
        })

        that.showStudyAmount()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getDuration: function (studyInfo) {
    if (studyInfo == undefined || studyInfo == '' || studyInfo == []) return 0
    var duration = 0
    for (var i = 0; i < studyInfo.length; i++) {
      duration = duration + studyInfo[i].totalDuration
    }
    return duration
  },

  getScore: function (studyInfo, studyType) {
    if (studyInfo == undefined || studyInfo == '' || studyInfo == []) return 0
    for (var i = 0; i < studyInfo.length; i++) {
      if (studyInfo[i].study_type == studyType) {
        return studyInfo[i].totalAmount
      }
    }
    return 0
  },

  showStudyAmount: function (options) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var pieChart = new wxCharts({
      animation: true,
      canvasId: 'pieCanvas',
      type: 'pie',
      series: [{
        name: '演讲' + this.data.speechScoreTotal + '次',
        data: parseInt(this.data.speechScoreTotal),
      }, {
          name: '复盘' + this.data.reviewScoreTotal + '次',
          data: parseInt(this.data.reviewScoreTotal),
      }, {
          name: '聆听' + this.data.listenScoreTotal + '次',
          data: parseInt(this.data.listenScoreTotal),
      }, {
          name: '鼓励' + this.data.evaluateScoreTotal + '次',
          data: parseInt(this.data.evaluateScoreTotal),
      }],
      width: windowWidth,
      height: 300,
      dataLabel: true,
    });
  },

  onLoad: function(options){
    if (options.userId == undefined) {

    } else {
      this.setData({
        userId: options.userId,
        nickName: options.nickName
      })
    }
    this.queryUserScore()
    this.queryLatestScore()
    //this.showStudyAmount(options)
  },
  
  showLatestScore: function (dateArray, scoreArray) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var columnChart = new wxCharts({
      canvasId: 'columnCanvas',
      type: 'column',
      animation: true,
      categories: dateArray,
      series: [{
        name: '学习积分',
        data: scoreArray,
        format: function (val, name) {
          return val.toFixed(0) + '分';
        }
      }],
      yAxis: {
        format: function (val) {
          return val + '分';
        },
        title: '',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 20
        }
      },
      width: windowWidth,
      height: 200,
    });
  }
});