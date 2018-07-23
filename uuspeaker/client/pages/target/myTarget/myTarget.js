var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
const uuid = require('../../../common/uuid');
var audioService = require('../../../common/audioService.js')

const innerAudioContext = wx.createInnerAudioContext()
var currentAudioIndex = 0
var roomId = ''
var lastDays= [7,30,100,365]
Page({
  data: {
    todayStarAmount: 0,
    userTarget: [],
    studyDurationStr:'',
    isPlay:0,
    audios:[],
    createDateStr:'',

    studyDuration: '',
    starAmount: '',
    leftDays: '',
    todayScore:0,
    userItems: [
      { 'name': '7天', 'value': '0' },
      { 'name': '30天', 'value': '1' },
      { 'name': '100天', 'value': '2' }
    ]

  },

  getCurrentTargetProgress: function (e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.currentTargetProgress`,
      login: true,
      method: 'get',
      success(result) {
        wx.hideLoading()
        that.setData({
          userTarget: result.data.data
        })

        if (result.data.data.hasTarget == 1){
          var userItems = that.data.userItems;
            that.setData({
              createDateStr : dateFormat.getSimpleFormatDate(result.data.data.create_date),
              studyDurationStr: lastDays[result.data.data.study_duration],
              leftDays: parseInt(lastDays[result.data.data.study_duration], 10) - parseInt(result.data.data.currentLastDays)
            });

          if (result.data.data.todayStarAmount >= result.data.data.star_amount){
            that.setData({
              todayScore:1
            })
          }
          that.initDateAndStatus(result.data.data.src, result.data.data.time_duration)
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  resetTarget: function(){
    wx.showModal({
      title: '提示',
      content: '是否废弃当前目标并重新制定？',
      success: (sm) => {
        if (sm.confirm) {
          this.doResetTarget()
        }
      }
    })
  },

  doResetTarget: function(){
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.userTarget`,
      data: { targetId: this.data.userTarget.target_id},
      login: true,
      method: 'delete',
      success(result) {
        wx.redirectTo({
          url: '../../target/createTarget/createTarget'
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  completeTarget: function(){
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.userTarget`,
      data: { targetId: this.data.userTarget.targetId},
      login: true,
      method: 'put',
      success(result) {
        wx.redirectTo({
          url: '../../target/createTarget/createTarget'
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  playAudio: function (e) {
    var src = this.data.audios[currentAudioIndex].src
    var currentDuration = this.data.audios[currentAudioIndex].currentDuration
    innerAudioContext.src = src
    innerAudioContext.seek(currentDuration)
    innerAudioContext.play()

    this.data.audios[currentAudioIndex].isPlay = 1
    this.setData({
      audios: this.data.audios,
      isPlay: 1
    })
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.pause()
    this.data.audios[currentAudioIndex].isPlay = 0
    this.setData({
      audios: this.data.audios,
      isPlay: 0
    })
  },

  changeSlider: function (e) {
    if (e.currentTarget.dataset.play == 0) return
    innerAudioContext.seek(innerAudioContext.duration * e.detail.value / 100)
  },

  initDateAndStatus: function (src, timeDuration) {
    var data = []
    data.push({ 'src': src, 'time_duration': timeDuration })
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      data[i].isPlay = 0
      data[i].timeDuration = data[i].time_duration
      data[i].currentDuration = 0
      data[i].sliderValue = 0
      data[i].currentTime = '00:00'
      data[i].duration = dateFormat.getFormatTimeForAudio(Math.floor(data[i].time_duration))
      data[i].audioIndex = i
    }
    console.log(data)
    this.setData({
      audios: data
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getCurrentTargetProgress()

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      wx.hideLoading()
    })
    innerAudioContext.onWaiting(() => {
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
      //audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      this.data.audios[currentAudioIndex].sliderValue = 0
      this.data.audios[currentAudioIndex].currentTime = '00:00'
      this.data.audios[currentAudioIndex].currentDuration = 0
      this.data.audios[currentAudioIndex].isPlay = 0
      this.setData({
        audios: this.data.audios
      })

    })
  },

  toHistoryTarget: function(){
    wx.navigateTo({
      url: '../../target/targetHistory/targetHistory',
    })
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '演讲学习目标' });
    wx.showShareMenu({
      withShareTicket: true
    })
  },




});