var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

//查询标记(1-查自己;2-查所有;3-查最赞)
var queryUserType = ''
var clubId= ''
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
    albumList: {},
    queryAlbumName: '',
    albumName: '',
    hideNotice: true,
    audioId: '',
    operationType: ''
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

  queryTaskInfo: function (e) {
    var index = e.currentTarget.dataset.item
    this.pressView(index)
    var thisQueryUserType = e.currentTarget.dataset.type
    if (queryUserType == thisQueryUserType) return
    queryUserType = thisQueryUserType
    queryPageType = 0
    this.setData({
      albumList: []
    })
    this.doQueryAlbumList()
  },

  //查询自由练习任务信息
  doQueryAlbumList: function () {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var queryData = {'clubId':clubId, 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime, queryUserType: queryUserType, albumName: this.data.queryAlbumName }
    console.log('queryData', queryData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/album.studySystem`,
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
          resultData = [].concat(result.data.data, that.data.albumList)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.albumList, result.data.data)
        }
        that.setData({
          albumList: resultData
        })
        that.formatDateAndStatus()
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
    var length = this.data.albumList.length
    firstDataTime = this.data.albumList[0].create_date
    lastDataTime = this.data.albumList[length - 1].create_date
  },

  formatDateAndStatus: function () {
    var data = this.data.albumList
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].createDateStr = dateFormat.getSimpleFormatDate(data[i].create_date)
      data[i].userType = queryUserType
      data[i].operationType = this.data.operationType
    }
    this.setData({
      albumList: data
    })
  },

  queryAlbumWithName: function (e) {
    queryPageType = 0
    this.doQueryAlbumList()
  },

  setAlbumName: function (e) {
    this.setData({
      albumName: e.detail.value
    })
  },

  setQueryAlbumName: function (e) {
    this.setData({
      queryAlbumName: e.detail.value
    })
  },

  queryAllAlbum: function (e) {
    this.setData({
      queryAlbumName: ''
    })
    queryPageType = 0
    this.doQueryAlbumList()
  },

  //点击取消隐藏评论框
  hideAlbumName: function () {
    this.setData({
      hideNotice: true,
    })
  },

  showAlbumName: function (e) {
    this.setData({
      hideNotice: false,
    })
  },

  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id + '&nickName=' + e.currentTarget.dataset.nick_name + '&avatarUrl=' + e.currentTarget.dataset.avatar_url,
    })
  },

  toAlbumContent: function (e) {
    wx.navigateTo({
      url: '../../album/albumContent/albumContent?albumId=' + e.currentTarget.dataset.album_id + '&userId=' + e.currentTarget.dataset.user_id,
    })
  },

  toFirstPage: function () {
    wx.navigateBack({ delta: 99999 })
  },

  onLoad: function (options) {
    clubId = options.clubId
    queryUserType = 1
    this.pressView(0)
    this.doQueryAlbumList()
  },

  onShow: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  onPullDownRefresh: function () {
    queryPageType = 1
    this.doQueryAlbumList()
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.doQueryAlbumList()
  },



})