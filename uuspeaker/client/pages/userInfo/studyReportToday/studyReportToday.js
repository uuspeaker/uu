var wxCharts = require('../../../utils/wxcharts.js');
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
 var nameArray = ['','演讲','复盘','聆听','鼓励']
Page({
  data: {
    chartTitle: '近期学习情况',
    isMainChartDisplay: true,
    studyData: [], 
    standardStudyAmount: 'none',
    userInfo:{},
    tandardStudyArr:[],
    userId: '',
    nickName: ''
  },

  //查询排名信息
  queryStudyReportToday: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.studyReportToday`,
      login: true,
      method: 'get',
      data:{'userId': this.data.userId},
      success(result) {
        wx.hideLoading()
        that.formatStudyData(result.data.data)
        that.showStudyAmount()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatStudyData : function(studyData){
    var standardStudyAmount = 999
    for(var i=0; i<studyData.length; i++){
      studyData[i].name = nameArray[studyData[i].study_type] + studyData[i].study_amount + '次'
      studyData[i].data = studyData[i].study_amount
      if (standardStudyAmount > studyData[i].study_amount){
        standardStudyAmount = studyData[i].study_amount
      }
    }
    if (standardStudyAmount == 999 || studyData.length != 4){
      standardStudyAmount = 0
    }
    this.setData({
      studyData: studyData,
      standardStudyAmount: standardStudyAmount,
      standardStudyArr: new Array(standardStudyAmount)
    })
    //this.showStudyAmount(studyData)
  },

  showStudyAmount: function () {
    //if (this.data.studyData == '' || this.data.studyData == [])return
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
      series: this.data.studyData,
      width: windowWidth,
      height: 300,
      dataLabel: true,
    });
  },

  initUserInfo: function () {
    var that = this
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success(result) {
        that.setData({
          userInfo: result.data.data,
        })
      },

      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      }
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
    this.initUserInfo()
    this.queryStudyReportToday()
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '懂你演讲' });
  },
  
});