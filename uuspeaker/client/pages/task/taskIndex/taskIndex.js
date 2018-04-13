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

    totalTaskScore: 0,
    speechScore: 0,
    commentScore: 0,

  },

  //查询用户参会数据
  queryUserScore: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/studyManage`,
      login: true,
      method: 'get',
      success(result) {
        console.log(result.data.data)
        //util.showSuccess('请求成功完成')
        that.setData({
          scoreData: result.data.data,
          totalScore: result.data.data.totalScore
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //查询用户任务完成情况
  queryTaskInfo: function () {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.taskIndex`,
      login: true,
      method: 'get',
      data:{taskType: 0},
      success(result) {
        console.log('timeDurationAll',result.data.data)
        that.setData({
          timeDurationAll: result.data.data,
        })
        that.setData({
          speechScore: that.getTotalTimeDuration(1),
          commentScore: that.getTotalTimeDuration(2)
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


  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.initUserInfo()
    this.queryUserScore()
    this.queryTaskInfo()
  },


})