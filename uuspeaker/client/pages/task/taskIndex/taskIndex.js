var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var userInfo = require('../../../common/userInfo.js')
var dateFormat = require('../../../common/dateFormat.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetStatus: 0,
    rank:'',
    newCommentAmount:0,

    userInfo: {},
    totalStudyDuration: 0,
    todayStudyDuration: 0,
    totalStudyDurationstr:0,

    myFansTotal:'',
    likeUserTotal: '',

    speechScore: 0,
    commentScore: 0,

  },

  //查询用户参会数据
  queryUserScore: function (e) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.studyDuration`,
      login: true,
      method: 'get',
      success(result) {
        wx.hideLoading()
        that.setData({
          totalStudyDuration: result.data.data.totalStudyDuration,
          todayStudyDuration: Math.floor((result.data.data.todayStudyDuration + 59) / 60),
          rank: userInfo.getRank(result.data.data.totalStudyDuration),
          totalStudyDurationstr: dateFormat.getFormatDuration2(result.data.data.totalStudyDuration)
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //查询用户参会数据
  queryLikeUserTotal: function () {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUserTotal`,
      login: true,
      method: 'get',
      success(result) {
        that.setData({
          likeUserTotal: result.data.data.likeUserTotal,
          myFansTotal: result.data.data.myFansTotal,
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //查询最近的评论
  queryNewCommentAmount: function () {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.newCommentAmount`,
      login: true,
      method: 'get',
      success(result) {
        that.setData({
          newCommentAmount: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getTargetTaskData: function(data,taskType){
    for(var i=0; i<data.length; i++){
      if (data[i].task_type == taskType){
        return data[i]
      }  
    }
    return { view_amount: 0, like_amount: 0, comment_amount: 0, isComplete: 0 }
  },

  getTotalTimeDuration: function(audioType){
    var timeDurationAll = this.data.timeDurationAll
    for (var i = 0; i<timeDurationAll.length; i++){
      if (timeDurationAll[i].audio_type == audioType){
        return Math.floor(timeDurationAll[i].totalDuration/60)
      }
    }
    return 0
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

  toDailyTask: function (e) {
    wx.navigateTo({
      url: '../dailyTaskToDo/dailyTaskToDo',
    })
  },

  toSpecialTaskList: function (e) {
    wx.navigateTo({
      url: '../specialTaskList/specialTaskList',
    })
  },
  
  toImpromptuIndex: function (e) {
    wx.navigateTo({
      url: '../../impromptu/impromptuIndex/impromptuIndex',
    })
  },

  toUserIntroduction: function () {
    wx.navigateTo({
      url: '../userIntroduction/userIntroduction',
    })
  },

  toStudyShow: function () {
  wx.navigateTo({
    url: '../../study/studyShow/studyShow',
  })
  },

  toLikeUserList: function (e) {
  wx.navigateTo({
    url: '../../userInfo/likeUserList/likeUserList?queryUserType=' + e.currentTarget.dataset.type,
  })
  },

  toDoSpecialTask: function (e) {
    wx.navigateTo({
      url: '../doSpecialTask/doSpecialTask?'
    })
  },

  openImpromptuRoom: function () {
    wx.navigateTo({
      url: '../../impromptu/impromptuRoom/impromptuRoom?operation=add'
    })
  },

  toNewCommentList: function () {
    wx.navigateTo({
      url: '../../userInfo/newCommentList/newCommentList'
    })
  },

  toAddSpeechName: function () {
    wx.navigateTo({
      url: '../../speech/addSpeechName/addSpeechName'
    })
  },

  toEvaluateSpeechName: function () {
    wx.navigateTo({
      url: '../../speech/evaluateSpeechName/evaluateSpeechName'
    })
  },

  toSpeechNameList: function () {
    wx.navigateTo({
      url: '../../speech/speechNameList/speechNameList'
    })
  },

  onLoad:function(){
    this.initUserInfo()
    this.queryLikeUserTotal()
    this.queryUserScore()
    this.queryNewCommentAmount()
  },
 
  onShow: function (options) {
    
  },

  onReady: function(){
    wx.showShareMenu({
      withShareTicket: true
    })
  },


})