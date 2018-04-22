var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

//1查询最近的 2查询自己的 3查询自己参与的 4查询自己关注的
var queryUserType = ''
//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    rooms: [],
    userName: '',
    tapTime: ''
  },

  initViewStyle: function () {
    var initViewStyle = new Array(10)
    for (var i = 0; i < initViewStyle.length; i++) {
      initViewStyle[i] = ''
    }
    this.setData({
      viewStyle: initViewStyle
    })
  },

  pressView: function (index) {
    this.initViewStyle()
    var tmpViewStyle = this.data.viewStyle
    tmpViewStyle[index] = 'font-weight: bold;color: #576b95;font-size: 16px;'
    this.setData({
      viewStyle: tmpViewStyle
    })
    var that = this
  },

  queryRoomInfo: function (e) {
    var index = e.currentTarget.dataset.item
    this.pressView(index)
    var thisQueryUserType = e.currentTarget.dataset.type
    if (queryUserType == thisQueryUserType) return
    queryUserType = thisQueryUserType
    queryPageType = 0
    this.setData({
      rooms: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryLastestRooms: function(){
    if (queryUserType == 1) return
    queryUserType = 1
    queryPageType = 0
    this.setData({
      rooms: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryMyRooms: function () {
    if (queryUserType == 2) return
    queryUserType = 2
    queryPageType = 0
    this.setData({
      rooms: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryJoinRooms: function () {
    if (queryUserType == 3) return
    queryUserType = 3
    queryPageType = 0
    this.setData({
      rooms: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryRoomsOfLikeUser: function () {
    if (queryUserType == 4) return
    queryUserType = 4
    queryPageType = 0
    this.setData({
      rooms: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  //查询最新房间信息
  queryImpromptuRooms: function (queryUserType) {
    wx.showLoading({
      title: '加载中',
    })
    var queryData = { 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime, queryUserType: queryUserType }
    console.log('queryData', queryData)
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuRoom`,
      login: true,
      method: 'get',
      data: queryData,
      success(result) {
        wx.hideLoading()
        console.log(result)
        if (result.data.data == '') {
          util.showSuccess('没有更多记录')
          return
        }
        var resultData = []
        if (queryPageType == 0) {
          resultData = result.data.data
        } else if (queryPageType == 1) {
          resultData = [].concat(result.data.data, that.data.rooms)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.rooms, result.data.data)
        }
        that.setData({
          rooms: resultData
        })
        that.formatDate()
        //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
        that.refreshDataId()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshDataId: function () {
    var length = this.data.rooms.length
    firstDataTime = this.data.rooms[0].start_date
    lastDataTime = this.data.rooms[length - 1].end_date
  },

  formatDate: function () {
    var data = this.data.rooms
    for (var i = 0; i < data.length; i++) {
      data[i].startDateStr = dateFormat.getTimeNoticeFuture(data[i].start_date, data[i].end_date)
      data[i].timeStatus = dateFormat.getTimeStatus(data[i].start_date, data[i].end_date)
      data[i].amountNotice = '报名【' + data[i].people_amount + '/' + data[i].max_amount + '】'

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
      + '&endDate=' + e.currentTarget.dataset.end_date
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

  onShow: function (options) {
    queryPageType = 0
    queryUserType = 1
    this.queryImpromptuRooms(queryUserType)
    this.pressView(0)

  },

  onPullDownRefresh: function () {
    queryPageType = 1
    this.queryImpromptuRooms(queryUserType)
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.queryImpromptuRooms(queryUserType)
  },
  
  onReady: function () {
    wx.setNavigationBarTitle({ title: '房间列表' });
  },

})