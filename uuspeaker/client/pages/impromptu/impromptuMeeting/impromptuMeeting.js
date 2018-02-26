var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')

//包含房间信息，房主信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    meetingUser: {},
    roomId: {},
    userInfo: {},
    isJoin: '',
    roomInfo:{},
    isHost:'',
    totalScore: 0
  },

  //查询用户参会数据
  queryMeetingUser: function () {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuMeeting`,
      login: true,
      data: {roomId:this.data.roomId},
      method: 'get',
      success(result) {
        //util.showSuccess('请求成功完成')
        that.setData({
          meetingUser: result.data.data.meetingUser,
          totalScore: result.data.data.hostTotalScore,
          isJoin: result.data.data.isJoin,
          roomInfo: result.data.data.roomInfo,
          isHost: result.data.data.isHost,
        })
        that.formatDate()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDate: function () {
    var data = this.data.meetingUser
    for (var i = 0; i < data.length; i++) {
      data[i].startDateStr = dateFormat.getTimeNotice(data[i].create_date)
    }
    var roomInfo = this.data.roomInfo
    roomInfo.startDateStr = dateFormat.getTimeNoticeFuture(roomInfo.start_date, roomInfo.start_time) 
    this.setData({
      meetingUser: data,
      roomInfo: roomInfo
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

  applyMeeting: function(e){
    var roleType = e.currentTarget.dataset.roletype
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuMeeting`,
      login: true,
      data: { roomId: this.data.roomId,roleType:roleType},
      method: 'post',
      success(result) {
        util.showSuccess('会议申请成功')
        that.queryMeetingUser()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  cancelMeeting: function(){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuMeeting`,
      login: true,
      data: { roomId: this.data.roomId },
      method: 'delete',
      success(result) {
        util.showSuccess('报名已取消')
        that.queryMeetingUser()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  vote: function(){
    wx.navigateTo({
      url: '../impromptuVote/impromptuVote?roomId=' + this.data.roomId 
    })
  },

  toImprmptuSurvey: function(){
    wx.navigateTo({
      url: '../impromptuSurvey/impromptuSurvey?roomId=' + this.data.roomId + "&meetingUser=" + JSON.stringify(this.data.meetingUser)
    })
  },

  toWatchSurvey: function () {
    wx.navigateTo({
      url: '../impromptuSurveyDetail/impromptuSurveyDetail?roomId=' + this.data.roomId + '&surveyStatus=' + this.data.roomInfo.survey_status
    })
  },

  toReport: function () {
    wx.navigateTo({
      url: '../../writeArticle/writeArticle?roomId=' + this.data.roomId
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      roomId: options.roomId
    })
    this.queryMeetingUser()
  },

  onShow: function () {
    this.queryMeetingUser()
  },

  onPullDownRefresh: function () {
    this.queryMeetingUser()
  },
})