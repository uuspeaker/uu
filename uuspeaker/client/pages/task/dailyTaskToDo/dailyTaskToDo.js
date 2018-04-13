var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetStatus: 0,

    scoreData: {},
    userInfo: {},
    totalScore: 0,
    planData: { view_amount: 0, like_amount: 0, comment_amount: 0, isComplete: 0 },
    reviewData: { view_amount: 0, like_amount: 0, comment_amount: 0, isComplete: 0 },
    likeData: { view_amount: 0, like_amount: 0, comment_amount: 0, isComplete: 0 },
    speechData: { view_amount: 0, like_amount: 0, comment_amount: 0, isComplete: 0 },
    evaluateData: { view_amount: 0, like_amount: 0, comment_amount: 0, isComplete: 0 },

    totalTaskScore: 0,
    baseScore: 0,
    likeScore: 0,
    commentScore: 0,

  },

  //查询用户任务完成情况
  queryTaskInfo: function () {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.thirtySeconds`,
      login: true,
      method: 'get',
      data: { taskType: 0 },
      success(result) {
        if (result.data.data.length == 0) return
        console.log(result.data.data)
        that.setData({
          userTask: result.data.data,
          planData: that.getTargetTaskData(result.data.data, 1),
          reviewData: that.getTargetTaskData(result.data.data, 2),
          likeData: that.getTargetTaskData(result.data.data, 3),
          speechData: that.getTargetTaskData(result.data.data, 4),
          EvaluateData: that.getTargetTaskData(result.data.data, 5),
        })
        that.calculateScore()
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

  calculateScore: function () {
    var data = this.data.userTask
    var totalTaskScore = 0
    var baseScore = 0
    var likeScore = 0
    var commentScore = 0
    for (var i = 0; i < data.length; i++) {
      baseScore = baseScore + 50
      likeScore = likeScore + data[i].like_amount
      commentScore = commentScore + (10 * data[i].comment_amount)
    }
    totalTaskScore = baseScore + likeScore + commentScore
    this.setData({
      totalTaskScore: totalTaskScore,
      baseScore: baseScore,
      likeScore: likeScore,
      commentScore: commentScore,
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

  toDoDailyTask: function (e) {
    var taskType = e.currentTarget.dataset.task_type
    wx.navigateTo({
      url: '../doDailyTask/doDailyTask?taskType=' + taskType,
    })
  },

  toUserIntroduction: function () {
    wx.navigateTo({
      url: '../userIntroduction/userIntroduction',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.initUserInfo()
    this.queryTaskInfo()
  },


})