var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')

const innerAudioContext = wx.createInnerAudioContext()
var showTimes = 0
//查询标记(1-查自己;2-查所有;3-查关注的)
var queryUserType = ''

//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''
var coinPlay = 0
var currentAudioIndex = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    audios: {},
    audioLikeUser: [],
    currentLikeUser: [],
    totalStudyDuration: 0,
    queryAudioName: '',
    albumId:'',
    userId:'',
    userInfo:{}
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
      audios: []
    })
    this.doQuerySpecialTask(queryUserType)
  },

  queryAudioWithName: function (e) {
    queryPageType = 0
    this.doQuerySpecialTask()
  },

  setAudioName: function (e) {
    this.setData({
      queryAudioName: e.detail.value
    })

  },

  queryAllAudio: function (e) {
    this.setData({
      queryAudioName: ''
    })
    queryPageType = 0
    this.doQuerySpecialTask()
  },

  clickAudioName: function (e) {
    this.setData({
      queryAudioName: e.currentTarget.dataset.audio_name
    })
    queryPageType = 0
    this.doQuerySpecialTask()
  },


  //查询自由练习任务信息
  doQuerySpecialTask: function () {
    wx.showLoading({
      title: '加载中',
    })
    //util.showBusy('请求中...')
    var queryData = { 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime,albumId: this.data.albumId }
    console.log('queryData', queryData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/album.albumContent`,
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
          resultData = [].concat(result.data.data, that.data.audios)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.audios, result.data.data)
        }
        that.setData({
          audios: resultData
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
    var length = this.data.audios.length
    firstDataTime = this.data.audios[0].create_date
    lastDataTime = this.data.audios[length - 1].create_date
  },

  //查询点赞用户信息
  queryAudioLikeUser: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.likeAudio`,
      login: true,
      method: 'get',
      data: { audioId: e.currentTarget.dataset.audio_id },
      success(result) {
        console.log(result)
        that.setData({
          audioLikeUser: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  initDateAndStatus: function () {
    var data = this.data.audios
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].createDateStr = dateFormat.getSimpleFormatDate(data[i].create_date)
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      data[i].isPlay = 0
      data[i].timeDuration = data[i].time_duration
      data[i].currentDuration = 0
      data[i].sliderValue = 0
      data[i].currentTime = '00:00'
      data[i].duration = dateFormat.getFormatTimeForAudio(Math.floor(data[i].time_duration))
      data[i].audioIndex = i
      data[i].isMine = 0
      if(this.data.userInfo.openId == this.data.userId){
        data[i].isMine = 1
      }
    }
    console.log(data)
    this.setData({
      audios: data
    })
  },

  switchPlayStatus: function (src) {
    var data = this.data.audios
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      if (data[i].src == src) {
        data[i].isPlay = 1
      } else {
        data[i].isPlay = 0
      }
    }
    console.log(data)
    this.setData({
      audios: data
    })
  },

  playAudio: function (e) {
    //播放音频时将前一个播放的音频置为暂停
    if (currentAudioIndex != '') {
      this.data.audios[currentAudioIndex].isPlay = 0
    }

    currentAudioIndex = e.currentTarget.dataset.index
    var src = this.data.audios[currentAudioIndex].src
    var audioId = this.data.audios[currentAudioIndex].audio_id
    var currentDuration = this.data.audios[currentAudioIndex].current_duration
    innerAudioContext.src = src
    innerAudioContext.seek(currentDuration)
    innerAudioContext.play()

    this.data.audios[currentAudioIndex].isPlay = 1
    this.setData({
      audios: this.data.audios
    })

    audioService.updateViewAmount(audioId)
  },

  editAudio: function (e) {
    var audioId = e.currentTarget.dataset.audio_id
    var audioName = e.currentTarget.dataset.audio_name
    var audioText = e.currentTarget.dataset.audio_text
    wx.navigateTo({
      url: '../../impromptu/myAudioManage/myAudioManage?audioId=' + audioId + '&audioName=' + audioName + '&audioText=' + audioText
    })
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.pause()
    this.data.audios[currentAudioIndex].isPlay = 0
    this.setData({
      audios: this.data.audios
    })
  },

  changeSlider: function (e) {
    if (e.currentTarget.dataset.play == 0) return
    innerAudioContext.seek(innerAudioContext.duration * e.detail.value / 100)
  },

  onLoad: function (options) {
    this.initUserInfo()
    this.setData({
      albumId: options.albumId,
      userId: options.userId
    })
    queryPageType = 0
    queryUserType = 1
    this.doQuerySpecialTask(queryUserType)
    this.pressView(0)
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
      if (innerAudioContext.src == audioService.getSrc()) return
      this.data.audios[currentAudioIndex].sliderValue = (100 * innerAudioContext.currentTime / innerAudioContext.duration)
      this.data.audios[currentAudioIndex].currentTime = dateFormat.getFormatTimeForAudio(Math.floor(innerAudioContext.currentTime))
      this.data.audios[currentAudioIndex].currentDuration = Math.floor(innerAudioContext.currentTime)
      this.setData({
        audios: this.data.audios
      })
    })

    innerAudioContext.onEnded((res) => {
      audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      this.data.audios[currentAudioIndex].sliderValue = 0
      this.data.audios[currentAudioIndex].currentTime = '00:00'
      this.data.audios[currentAudioIndex].currentDuration = 0
      this.data.audios[currentAudioIndex].isPlay = 0
      this.setData({
        audios: this.data.audios
      })

    })
  },

  onShow: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  onPullDownRefresh: function () {
    queryPageType = 1
    this.doQuerySpecialTask(queryUserType)
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.doQuerySpecialTask(queryUserType)
  },

  onHide: function () {
    //innerAudioContext.stop();
  },

  onUnload: function () {
    innerAudioContext.stop();
  },

  toAudioDetail: function (e) {
    innerAudioContext.stop();
    wx.navigateTo({
      url: '../../impromptu/audioDetail/audioDetail?audioId=' + e.currentTarget.dataset.audio_id,
    })
  },

  toUserInfo: function (e) {
    innerAudioContext.stop();
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id + '&nickName=' + e.currentTarget.dataset.nick_name + '&avatarUrl=' + e.currentTarget.dataset.avatar_url,
    })
  },

  toAllSpecialTask: function (e) {
    innerAudioContext.stop();
    wx.navigateTo({
      url: '../allSpecialTask/allSpecialTask'
    })
  },

  toDoSpecialTask: function (e) {
    innerAudioContext.stop();
    wx.navigateTo({
      url: '../doSpecialTask/doSpecialTask'
    })
  },

  toAudioAlbum: function (e) {
    innerAudioContext.stop();
    wx.navigateTo({
      url: '../../album/albumList/albumList'
    })
  },

  deleteAlbumContent: function (e) {
    var content = '是否确定删除？'
    wx.showModal({
      title: '提示',
      content: content,
      success: (sm) => {
        if (sm.confirm) {
          this.doDeleteAlbumContent(e)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  doDeleteAlbumContent: function (e) {
    var audioId = e.currentTarget.dataset.audio_id
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/album.albumContent`,
      login: true,
      data: { 'albumId': this.data.albumId, 'audioId': audioId },
      method: 'delete',
      success(result) {
        wx.hideLoading()
        util.showSuccess('操作成功')
        var data = that.data.audios
        for (var i = 0; i < data.length; i++) {
          if (data[i].audio_id == audioId) {
            data.splice(i, 1)
          }
        }
        that.setData({
          audios: data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
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

  

  onReady: function () {
    wx.setNavigationBarTitle({ title: '听演讲' });
    wx.showShareMenu({
      withShareTicket: true
    })
  },

})