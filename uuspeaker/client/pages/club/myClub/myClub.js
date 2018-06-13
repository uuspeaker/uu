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
    roomInfo: {},
    isHost: '',
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

  //查询用户参会数据
  queryMeetingUser: function () {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.myClub`,
      login: true,
      data: { roomId: this.data.roomId },
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
      data[i].startDateStr = dateFormat.format(new Date(data[i].create_date),'yyyy年M月d日')
      data[i].userRank = userInfo.getRank(data[i].totalScore)
    }
    this.setData({
      meetingUser: data,
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

  applyMeetingDefault: function (e) {
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

  cancelMeeting: function () {
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

  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id
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
  },

  onPullDownRefresh: function () {
    // this.queryMeetingUser()
  },
})