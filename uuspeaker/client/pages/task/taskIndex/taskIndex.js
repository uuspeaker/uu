var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var userInfo = require('../../../common/userInfo.js')
var dateFormat = require('../../../common/dateFormat.js')

const updateManager = wx.getUpdateManager()
qcloud.setLoginUrl(`${config.service.host}/weapp/login`);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetStatus: 0,
    isLogin: '',
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
    showContent:'',
    totalStarAmount:0,

    myFansTotal: '',
    likeUserTotal: '',
    myTargetProgress:'',

    speechScore: 0,
    commentScore: 0,

  },

  //查询学习力积分
  queryUserScore: function (e) {
    // wx.showLoading({
    //   title: '加载中',
    // })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/studyData.userScore`,
      login: true,
      method: 'get',
      data:{'userId':''},
      success(result) {
        console.log(result.data.data)
        that.setData({
          totalStarAmount: result.data.data.totalStarAmount,
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
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUserTotal`,
      login: true,
      method: 'get',
      success(result) {
        wx.hideLoading()
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

  //查询用户目标数据
  queryTargetProgress: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.todayTargetProgress`,
      login: true,
      method: 'get',
      success(result) {
        that.setData({
          myTargetProgress: result.data.data,
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
      url: '../specialTaskList2/specialTaskList2?totalStudyDuration=' + this.data.totalStudyDuration,
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
      url: '../../impromptu/quickMatch/quickMatch?start=0&rank= ' + this.data.rank,
    })
  },

  toMyIntroduction: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../userInfo/myIntroduction/myIntroduction?showContent=' + this.data.showContent,
    })
  },

  toScoreRank: function (e) {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../studyData/scoreRank/scoreRank?scoreType=' + e.currentTarget.dataset.type,
    })
  },

  toStudyShow: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../study/studyShow/studyShow?myFansTotal=' + this.data.myFansTotal 
      + '&rank=' + this.data.rank 
      + '&speechScoreTotal=' + this.data.speechScoreTotal 
      + '&reviewScoreTotal=' + this.data.reviewScoreTotal 
      + '&listenScoreTotal=' + this.data.listenScoreTotal 
      + '&evaluateScoreTotal=' + this.data.evaluateScoreTotal 
      + '&avatarUrl=' + this.data.userInfo.avatarUrl 
      + '&nickName=' + this.data.userInfo.nickName,
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

  toTaskList: function () {
    if (this.data.isLogin == 0) {
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../taskList/taskList'
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

  toSpeechNameList: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../speech/speechNameList/speechNameList'
    })
  },

  toStudyReportTotal: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../studyData/studyReportTotal/studyReportTotal?speechScoreTotal=' + this.data.speechScoreTotal
      + '&reviewScoreTotal=' + this.data.reviewScoreTotal
      + '&listenScoreTotal=' + this.data.listenScoreTotal
      + '&evaluateScoreTotal=' + this.data.evaluateScoreTotal,
    })
  },

  toLetter: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    wx.navigateTo({
      url: '../../letter/letterForLevel3/letterForLevel3?nickName=' + this.data.userInfo.nickName
      + '&rank=' + this.data.rank
    })
  },

  toStudyReportToday: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    if (this.data.showContent != 1)return
    wx.navigateTo({
      url: '../../studyData/studyReportToday/studyReportToday'
    })
  },

  toFeedbackList: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    if (this.data.showContent != 1)return
    wx.navigateTo({
      url: '../../feedback/feedbackList/feedbackList'
    })
  },

  toMyClub: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    if (this.data.showContent != 1)return
    wx.navigateTo({
      url: '../../club/myClub/myClub'
    })
  },

  toScoreLevel: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    if (this.data.showContent != 1)return
    wx.navigateTo({
      url: '../../score/scoreLevel/scoreLevel?totalStudyDuration=' + this.data.totalStudyDuration + '&rank=' + this.data.rank
    })
  },

  toStarList: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    if (this.data.showContent != 1)return
    wx.navigateTo({
      url: '../../studyData/starList/starList?totalStudyDuration=' + this.data.totalStudyDuration + '&rank=' + this.data.rank
    })
  },

  toMyTarget: function () {
    if(this.data.isLogin == 0){
      util.showSuccess('请先登陆')
      return
    }
    if (this.data.showContent != 1)return
    wx.navigateTo({
      url: '../../target/myTarget/myTarget?totalStudyDuration=' + this.data.totalStudyDuration + '&rank=' + this.data.rank
    })
  },

  onShow: function(){
    if (this.data.isLogin == 1) {
    this.queryNewCommentAmount()
    this.queryUserScore()
    this.queryTargetProgress()
    }
  },

  onLoad: function () {
    //this.doLogin()
    qcloud.login({
      success: result => {
        console.log('userInfo', result)
        this.setData({
          isLogin: 1
        })
        console.log('login success')
        this.initIndex()
      },
      fail: () => {
        console.log('login fail')
        this.setData({
          isLogin: 0
        })
      }
    })
    
    
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

  initIndex: function (options) {
    this.queryLikeUserTotal()
    this.queryTargetProgress()
    this.queryNewCommentAmount()
    this.queryUserScore()
    this.initUserInfo()
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.userControl`,
      login: true,
      method: 'get',
      success(result) {
        console.log('result',result)
        that.setData({
          showContent: result.data.data
        })
  
      },

      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      }
    })
    
  },

  onReady: function () {
    wx.showShareMenu({
      withShareTicket: true
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })

    })
  },


})