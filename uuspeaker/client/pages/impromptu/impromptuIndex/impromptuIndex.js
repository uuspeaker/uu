var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    textStyle: [],
    rooms: [],
    userName: '12',
    modeItems: ['即兴演讲', '备稿演讲', '工作坊'],
    languageItems: ['中文', 'English'],
    tapTime: ''
  },

  initViewStyle: function () {
    var initViewStyle = new Array(10)
    for (var i = 0; i < initViewStyle.length; i++) {
      initViewStyle[i] = 'box-shadow: 1px 1px 2px 2px #888888;'
    }
    this.setData({
      viewStyle: initViewStyle
    })
  },

  pressView: function (e) {
    this.initViewStyle()
    var index = e.currentTarget.dataset.item
    var tmpViewStyle = this.data.viewStyle
    tmpViewStyle[index] = 'box-shadow:0px 0px 0px 0px'
    this.setData({
      viewStyle: tmpViewStyle
    })
    var that = this
    //setTimeout(this.initViewStyle, 200);
  },

  //查询最新房间信息
  queryImpromptuRooms: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuRoom`,
      login: true,
      method: 'get',
      success(result) {
        that.setData({
          rooms: result.data.data
        })
        //将时间格式化显示
        that.formatDate()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDate: function () {
    var data = this.data.rooms
    for (var i = 0; i < data.length; i++) {
      data[i].startDateStr = dateFormat.getTimeNoticeFuture(data[i].start_date, data[i].start_time)
      data[i].timeStatus = dateFormat.getTimeStatus(data[i].start_date, data[i].start_time, data[i].end_time)
    }
    console.log(data)
    this.setData({
      rooms: data
    })
  },

  toImpromptuMeeting: function (e) {
    var roomId = e.currentTarget.dataset.room_id
    var userId = e.currentTarget.dataset.user_id

    wx.navigateTo({
      url: '../impromptuMeeting/impromptuMeeting?' + '&roomId=' + e.currentTarget.dataset.room_id
    })
  },

  openImpromptuRoom: function () {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=add'
    })
  },

  updateImpromptuRoom: function (e) {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=modify'
      + '&roomId=' + e.currentTarget.dataset.room_id
      + '&startDate=' + e.currentTarget.dataset.start_date
      + '&startTime=' + e.currentTarget.dataset.start_time
      + '&endTime=' + e.currentTarget.dataset.end_time
      + '&mode=' + e.currentTarget.dataset.mode
      + '&language=' + e.currentTarget.dataset.language
      + '&notice=' + e.currentTarget.dataset.notice
    })
  },

  toMyRoom: function(){
    wx.navigateTo({
      url: '../myImpromptuIndex/myImpromptuIndex',
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
    //this.initViewStyle()
    //this.queryImpromptuRooms()
  },

  onShow: function (options) {
    this.initViewStyle()
    this.queryImpromptuRooms()

  },

  onPullDownRefresh: function () {
    this.initViewStyle()
    this.queryImpromptuRooms()
  },


})