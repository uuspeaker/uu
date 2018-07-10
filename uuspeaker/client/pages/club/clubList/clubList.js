var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')

//1查询最近的 2查询自己的 3查询自己参与的 4查询自己关注的
var queryUserType = ''
//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''

const innerAudioContext = wx.createInnerAudioContext()
var currentAudioIndex = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    clubs: [],
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
    firstDataTime = ''
    lastDataTime = ''
    this.setData({
      clubs: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryLastestRooms: function () {
    if (queryUserType == 1) return
    queryUserType = 1
    queryPageType = 0
    this.setData({
      clubs: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryMyRooms: function () {
    if (queryUserType == 2) return
    queryUserType = 2
    queryPageType = 0
    this.setData({
      clubs: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryJoinRooms: function () {
    if (queryUserType == 3) return
    queryUserType = 3
    queryPageType = 0
    this.setData({
      clubs: []
    })
    this.queryImpromptuRooms(queryUserType)
  },

  queryRoomsOfLikeUser: function () {
    if (queryUserType == 4) return
    queryUserType = 4
    queryPageType = 0
    this.setData({
      clubs: []
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
      url: `${config.service.host}/weapp/club.clubInfo`,
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
          resultData = [].concat(result.data.data, that.data.clubs)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.clubs, result.data.data)
        }
        that.setData({
          clubs: resultData
        })
        that.initDateAndStatus()
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
    var length = this.data.clubs.length
    firstDataTime = this.data.clubs[0].start_date
    lastDataTime = this.data.clubs[length - 1].end_date
  },

  formatDate: function () {
    var data = this.data.clubs
    for (var i = 0; i < data.length; i++) {
      data[i].createDateStr = dateFormat.format(new Date(data[i].create_date),'yyyy年M月d日')
    }
    console.log(data)
    this.setData({
      clubs: data
    })
  },

  playAudio: function (e) {
    var data = this.data.clubs
    //播放音频时将前一个播放的音频置为暂停
    if (currentAudioIndex != '') {
      this.data.clubs[currentAudioIndex].isPlay = 0
    }

    currentAudioIndex = e.currentTarget.dataset.index
    if (!(data[currentAudioIndex].time_duration > 0))return
    var src = data[currentAudioIndex].src
    var audioId = data[currentAudioIndex].audio_id
    var currentDuration = data[currentAudioIndex].current_duration
    innerAudioContext.src = src
    innerAudioContext.seek(currentDuration)
    innerAudioContext.play()

    data[currentAudioIndex].isPlay = 1
    this.setData({
      clubs: data
    })

  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.pause()
    this.data.clubs[currentAudioIndex].isPlay = 0
    this.setData({
      clubs: this.data.clubs
    })
  },

  changeSlider: function (e) {
    if (e.currentTarget.dataset.play == 0) return
    innerAudioContext.seek(innerAudioContext.duration * e.detail.value / 100)
  },

  initDateAndStatus: function () {
    var data = this.data.clubs
    console.log('initDateAndStatus',data)
    for (var i = 0; i < data.length; i++) {
      console.log(i)
      var now = new Date()
      data[i].createDateStr = dateFormat.format(new Date(data[i].create_date), 'yyyy年M月d日')
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      data[i].isPlay = 0
      data[i].timeDuration = data[i].time_duration
      data[i].currentDuration = 0
      data[i].sliderValue = 0
      data[i].currentTime = '00:00'
      data[i].duration = dateFormat.getFormatTimeForAudio(Math.floor(data[i].time_duration))
      data[i].audioIndex = i
    }
    this.setData({
      clubs: data
    })
  },

  toImpromptuMeeting: function (e) {
    var roomId = e.currentTarget.dataset.room_id
    var userId = e.currentTarget.dataset.user_id

    wx.navigateTo({
      url: '../impromptuMeeting/impromptuMeeting?' + '&roomId=' + e.currentTarget.dataset.room_id
    })
  },

  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id
    })
  },

  createClub: function () {
    wx.navigateTo({
      url: '../../club/createClub/createClub?operation=add'
    })
  },

  toClubShow: function (e) {
    var clubId = e.currentTarget.dataset.club_id
    var clubName = e.currentTarget.dataset.club_name
    wx.navigateTo({
      url: '../../club/clubShow/clubShow?clubId=' + clubId + '&clubName=' + clubName
    })
  },

  onLoad: function (options) {
    queryPageType = 0
    queryUserType = 1
    this.queryImpromptuRooms(queryUserType)
    this.pressView(0)
    //this.initDateAndStatus()

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      wx.hideLoading()
    })
    innerAudioContext.onWaiting(() => {
      // if (innerAudioContext.duration < 5) return
      // if (innerAudioContext.src == audioService.getSrc()) return
      wx.showLoading({
        title: '音频加载中',
      })
    })
    innerAudioContext.onError((res) => {
      wx.hideLoading()
      util.showNotice('音频加载失败')
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      this.setData({
        currentLikeUser: []
      })
    })

    innerAudioContext.onTimeUpdate(() => {
      var data = this.data.clubs
      if (innerAudioContext.src == audioService.getSrc()) return
      data[currentAudioIndex].sliderValue = (100 * innerAudioContext.currentTime / innerAudioContext.duration)
      data[currentAudioIndex].currentTime = dateFormat.getFormatTimeForAudio(Math.floor(innerAudioContext.currentTime))
      data[currentAudioIndex].currentDuration = Math.floor(innerAudioContext.currentTime)
      this.setData({
        clubs: data
      })
    })

    innerAudioContext.onEnded((res) => {
      var data = this.data.clubs
      //audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      data[currentAudioIndex].sliderValue = 0
      data[currentAudioIndex].currentTime = '00:00'
      data[currentAudioIndex].currentDuration = 0
      data[currentAudioIndex].isPlay = 0
      this.setData({
        clubs: data
      })

    })
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
    wx.setNavigationBarTitle({ title: '俱乐部列表' });
  },

  onShow: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  onUnload: function () {
    innerAudioContext.stop();
  },

})