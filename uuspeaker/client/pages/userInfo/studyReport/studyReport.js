var wxCharts = require('../../../utils/wxcharts.js');
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

Page({
  data: {
    chartTitle: '近期学习情况',
    isMainChartDisplay: true,
    userScore:[]
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
        name: '演讲' + options.speechScoreTotal + '次',
        data: parseInt(options.speechScoreTotal),
      }, {
          name: '复盘' + options.reviewScoreTotal + '次',
          data: parseInt(options.reviewScoreTotal),
      }, {
          name: '聆听' + options.listenScoreTotal + '次',
          data: parseInt(options.listenScoreTotal),
      }, {
          name: '鼓励' + options.evaluateScoreTotal + '次',
          data: parseInt(options.evaluateScoreTotal),
      }],
      width: windowWidth,
      height: 300,
      dataLabel: true,
    });
  },

  onLoad: function(options){
    this.queryLatestScore()
    this.showStudyAmount(options)
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