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
    isLogin: 0,
    rank: 'Lv1：乞丐演讲君',
    newCommentAmount: 0,

    userInfo: {},
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

    myFansTotal: '',
    likeUserTotal: '',

    speechScore: 0,
    commentScore: 0,

  },

  //查询学习力积分
  queryUserScore: function (e) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.userScore`,
      login: true,
      method: 'get',
      success(result) {
        wx.hideLoading()
        that.setData({
          rank: userInfo.getRank(Math.floor(that.getDuration(result.data.data.totalStudyInfo))),
          totalStudyInfo: result.data.data.totalStudyInfo,
          speechScoreTotal: that.getScore(result.data.data.totalStudyInfo,1),
          reviewScoreTotal: that.getScore(result.data.data.totalStudyInfo,2),
          listenScoreTotal: that.getScore(result.data.data.totalStudyInfo,3),
          evaluateScoreTotal: that.getScore(result.data.data.totalStudyInfo,4),
          totalStudyDuration: Math.floor((that.getDuration(result.data.data.totalStudyInfo) + 59) / 60),
          todayStudyInfo: result.data.data.todayStudyInfo,
          speechScoreToday: that.getScore(result.data.data.todayStudyInfo,1),
          reviewScoreToday: that.getScore(result.data.data.todayStudyInfo,2),
          listenScoreToday: that.getScore(result.data.data.todayStudyInfo,3),
          evaluateScoreToday: that.getScore(result.data.data.todayStudyInfo,4),
          todayStudyDuration: Math.floor((that.getDuration(result.data.data.todayStudyInfo) + 59) / 60),
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getScore: function(studyInfo,studyType){
    console.log('studyInfo', studyInfo)
    if (studyInfo == undefined || studyInfo == '' || studyInfo == [])return 0
    for (var i = 0; i < studyInfo.length; i++){
      if (studyInfo[i].study_type == studyType){
        return studyInfo[i].totalAmount
      }
    }
    return 0
  },
  
  getDuration: function(studyInfo){
    if (studyInfo == undefined || studyInfo == '' || studyInfo == [])return 0
    var duration = 0
    for (var i = 0; i < studyInfo.length; i++){
      duration = duration + studyInfo[i].totalDuration
    }
    return duration
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

  getTargetTaskData: function (data, taskType) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].task_type == taskType) {
        return data[i]
      }
    }
    return { view_amount: 0, like_amount: 0, comment_amount: 0, isComplete: 0 }
  },

  getTotalTimeDuration: function (audioType) {
    var timeDurationAll = this.data.timeDurationAll
    for (var i = 0; i < timeDurationAll.length; i++) {
      if (timeDurationAll[i].audio_type == audioType) {
        return Math.floor(timeDurationAll[i].totalDuration / 60)
      }
    }
    return 0
  },

  toDailyTask: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../dailyTaskToDo/dailyTaskToDo',
    })
  },

  toSpecialTaskList: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../specialTaskList/specialTaskList',
    })
  },

  toImpromptuIndex: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../impromptu/impromptuIndex/impromptuIndex',
    })
  },
  toQuickMatch: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../impromptu/quickMatch/quickMatch?start=0',
    })
  },

  toMyIntroduction: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../userInfo/myIntroduction/myIntroduction',
    })
  },

  toScoreRank: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../userInfo/scoreRank/scoreRank?scoreType=' + e.currentTarget.dataset.type,
    })
  },

  toStudyShow: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../study/studyShow/studyShow',
    })
  },

  toLikeUserList: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../userInfo/likeUserList/likeUserList?queryUserType=' + e.currentTarget.dataset.type,
    })
  },

  toDoSpecialTask: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../doSpecialTask/doSpecialTask?'
    })
  },

  openImpromptuRoom: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../impromptu/impromptuRoom/impromptuRoom?operation=add'
    })
  },

  toNewCommentList: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../userInfo/newCommentList/newCommentList'
    })
  },

  toSpeechNameList: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../speech/speechNameList/speechNameList'
    })
  },

  toStudyRank: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../rank/studyRank/studyRank'
    })
  },

  toStudyNow: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../impromptu/userMatch/userMatch'
    })
  },

  toEvaluateSpeechName: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../speech/evaluateSpeechName/evaluateSpeechName'
    })
  },

  onShow: function () {
    var that = this
    
    qcloud.login({
      success: function () {
        that.setData({
          isLogin: 1
        })
        console.log('login success')
        that.initIndex()
      },
      fail:function(){
        console.log('login fail')
        that.setData({
          isLogin : 0
        })
      }
    })
    // wx.checkSession({
    //   success: function () {
    //     that.setData({
    //       isLogin: 1
    //     })
    //     //session_key 未过期，并且在本生命周期一直有效
    //     console.log('has login')
    //     that.initIndex()
    //   },
    //   fail: function () {
    //     that.setData({
    //       isLogin: 0
    //     })
    //     // session_key 已经失效，需要重新执行登录流程
    //     console.log('has not login')
    //     wx.login({
    //       success: function () {
    //         that.initIndex()
    //       },
    //     })
    //   }
    // })
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

  initIndex: function (options) {
    this.initUserInfo()
    this.queryLikeUserTotal()
    this.queryUserScore()
    this.queryNewCommentAmount()
  },

  onReady: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },


})