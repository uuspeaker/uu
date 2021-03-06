var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')
var getlogininfo = require('../../../getlogininfo.js')
var userInfo = require('../../../common/userInfo.js')

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

  updateImpromptuRoom: function (e) {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=modify'
      + '&roomId=' + e.currentTarget.dataset.room_id
      + '&startDate=' + e.currentTarget.dataset.start_date
      + '&endDate=' + e.currentTarget.dataset.end_date
      + '&title=' + e.currentTarget.dataset.title
      + '&maxAmount=' + e.currentTarget.dataset.max_amount
      + '&notice=' + e.currentTarget.dataset.notice
    })
  },

  viewImpromptuRoom: function (e) {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=view'
      + '&roomId=' + e.currentTarget.dataset.room_id
      + '&startDate=' + e.currentTarget.dataset.start_date
      + '&endDate=' + e.currentTarget.dataset.end_date
      + '&title=' + e.currentTarget.dataset.title
      + '&maxAmount=' + e.currentTarget.dataset.max_amount
      + '&notice=' + e.currentTarget.dataset.notice
    })
  },

  // 进入rtcroom页面
  createAndGoRoom: function (e) {
    var self = this;
    // 防止两次点击操作间隔太快
    var nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
      return;
    }
    var mode = e.currentTarget.dataset.mode
    var roomID = e.currentTarget.dataset.room_id
    var roomName = this.data.roomInfo.title

    qcloud.request({
      
      url: `${config.service.host}/weapp/multi_room.isRoomExist`,
      login: true,
      data: { 'roomId': roomID },
      method: 'post',
      success(result) {
        console.log('multi_room.isRoomExist')
        console.log(result)
        var isRoomExist = result.data.isRoomExist
        var enterType = 'create'
        if (isRoomExist) {
          enterType = 'enter'
        }
        var url = '../room/room?type=' + enterType + '&roomName=' + roomName + '&roomID=' + roomID + '&userId=' + self.data.roomInfo.user_id
        console.log(url)
        wx.navigateTo({
          url: url
        });
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })

    self.setData({ 'tapTime': nowTime });
  },

  //查询用户参会数据
  queryMeetingUser: function () {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuMeeting`,
      login: true,
      data: {roomId:this.data.roomId},
      method: 'get',
      success(result) {
        wx.hideLoading()
        //util.showSuccess('请求成功完成')
        that.setData({
          meetingUser: result.data.data.meetingUser,
          //totalScore: result.data.data.hostTotalScore,
          //hostRank: userInfo.getRank(result.data.data.hostTotalScore),
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
      data[i].userRank = userInfo.getRank(data[i].totalScore)
    }
    var roomInfo = this.data.roomInfo
    roomInfo.startDateStr = dateFormat.getTimeNoticeFuture(roomInfo.start_date, roomInfo.end_date) 
    roomInfo.amountNotice = '   【' + roomInfo.people_amount + '/' + roomInfo.max_amount + '】'
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

  applyMeetingDefault: function(e){
    this.applyMeeting('演讲者')
  },

  applyMeetingWithName: function (e) {
    var role = e.detail.value
    this.applyMeeting(role)
  },

  applyMeeting: function (role) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuMeeting`,
      login: true,
      data: { roomId: this.data.roomId, role: role },
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

  toUserAudio: function () {
    wx.navigateTo({
      url: '../../impromptu/userAudio/userAudio?roomId=' + this.data.roomId
    })
  },

  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id
    })
  },

  onReady1: function () {
    wx.showShareMenu({
      withShareTicket:true
    })
    var self = this;
    //this.getRoomList(function () { });
    getlogininfo.getLoginInfo({
      type: 'multi_room',
      success: function (ret) {
      },
      fail: function (ret) {
        self.data.isGetLoginInfo = false;
        wx.hideLoading();
        wx.showModal({
          title: '获取登录信息失败',
          content: ret.errMsg,
          showCancel: false,
          complete: function () {
            wx.navigateBack({});
          }
        });
      }
    });
  },

  // onShareAppMessage: function(options){
  //   return {
  //     title: '跟我一起玩' + this.data.roomInfo.title + '吧' ,
  //     path: '/pages/impromptu/impromptuMeeting/impromptuMeeting=' + this.data.roomId,
  //     success: function (res) {
  //       // 转发成功
  //     },
  //     fail: function (res) {
  //       // 转发失败
  //     }
  //   }
  // },

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
  },

  onPullDownRefresh: function () {
    // this.queryMeetingUser()
  },
})