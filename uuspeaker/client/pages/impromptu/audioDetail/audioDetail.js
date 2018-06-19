var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')
const uuid = require('../../../common/uuid');

var tempFilePath = ''

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext();

var startDate
var endDate
var timeDuration = 0
var coinPlay = 0
var speechTypeArr = ['即兴演讲','备稿演讲','微课']

//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pressStyle:'box-shadow: 0 2px 10px rgba(0, 49, 114, .5);',
    audioId: '',
    audioData:[],
    audioDataLike:[],
    likeIt: 0,
    audioDataComment:[],
    isPlay:0,
    playNotice:1
  },

  deleteAudio: function () {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          that.doCancel()
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  doCancel: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.myAudio`,
      data: { 'audioId': this.data.audioId },
      login: true,
      method: 'delete',
      success(result) {
        util.showSuccess('已成功删除')
        wx.navigateBack({ delta: 1 })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //查询最新房间信息
  queryAudioDetail: function (e) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.audioDetail`,
      login: true,
      method: 'get',
      data: { audioId: this.data.audioId },
      success(result) {
        wx.hideLoading()
        console.log(result)
        that.setData({
          audioData: result.data.data.audioData,
          audioDataLike: result.data.data.audioDataLike,
          likeIt: result.data.data.likeIt,
        })
        that.formatDateAndStatus()
        wx.setNavigationBarTitle({ title: speechTypeArr[that.data.audioData[0].speech_type] });
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //查询最新房间信息
  queryAudioComment: function () {
    //util.showBusy('请求中...')
    var queryData = { 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime, audioId: this.data.audioId }
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioComment`,
      login: true,
      method: 'get',
      data: queryData,
      success(result) {
        console.log(result)
        if (result.data.data == '') {
          if (queryPageType != 0){
            util.showSuccess('没有更多记录')
          }
          
          return
        }
        var resultData = []
        if (queryPageType == 0) {
          resultData = result.data.data
        } else if (queryPageType == 1) {
          resultData = [].concat(that.data.audioDataComment,result.data.data)
        } else if (queryPageType == 2) {
          resultData = [].concat(result.data.data, that.data.audioDataComment)
        }
        var audioDataComment = that.doFormatDateAndStatus(resultData)
        that.setData({
          audioDataComment: audioDataComment
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

  formatDateAndStatus: function (src) {
    var audioData = this.doFormatDateAndStatus(this.data.audioData,src)
    var audioDataLike = this.doFormatDateAndStatus(this.data.audioDataLike, src)
    var audioDataComment = this.doFormatDateAndStatus(this.data.audioDataComment, src)
    this.setData({
      audioData: audioData,
      audioDataLike: audioDataLike,
      audioDataComment: audioDataComment

    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshDataId: function () {
    var length = this.data.audioDataComment.length
    firstDataTime = this.data.audioDataComment[0].create_date
    lastDataTime = this.data.audioDataComment[length - 1].create_date
  },

  doFormatDateAndStatus: function(data,src){
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].createDateStr = dateFormat.getSimpleFormatDate(data[i].create_date)
      data[i].timeDurationStr = dateFormat.getFormatDuration(data[i].time_duration)
      if (data[i].src == src) {
        data[i].isPlay = 1
      } else {
        data[i].isPlay = 0
      }
    }
    return data
  },

  increaseCommentTime: function () {
    var data = this.data.audioData
    for (var i = 0; i < data.length; i++) {
      data[i].comment_amount = data[i].comment_amount + 1
    }
    this.setData({
      audioData: data
    })
  },

  likeAudio: function () {
    console.log('like it')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioLike`,
      login: true,
      method: 'post',
      data: { audioId: this.data.audioId},
      success(result) {
        that.queryAudioDetail()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  cancelLike: function (e) {
    console.log('cancelLike it')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioLike`,
      login: true,
      method: 'delete',
      data: { audioId: this.data.audioId },
      success(result) {
        that.queryAudioDetail()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  updateViewTimes: function (e) {
    var src = e.currentTarget.dataset.src
    var audioId = e.currentTarget.dataset.audio_id
    innerAudioContext.src = src
    innerAudioContext.play()
    this.formatDateAndStatus(src)

    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioView`,
      login: true,
      method: 'post',
      data: { audioId: audioId },
      success(result) {
        that.updateViewAmount(audioId)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  switchPlayStatus: function (src) {
    var data = this.data.audioData
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
      audioData: data
    })
  },

  playAudio: function (e) {
      this.updateViewTimes(e)
  },

  updateViewAmount: function (audioId) {
    var data = this.data.audioData
    for (var i = 0; i < data.length; i++) {
      if(data[i].audio_id == audioId){
        data[i].view_amount = data[i].view_amount + 1
      }   
    }
    this.setData({
      audioData: data
    })
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.stop()
    this.formatDateAndStatus()
  },

  startRecord: function () {
    console.log(this.data.playNotice)
    recorderManager.start(config.options)
    startDate = new Date()
    this.setData({
      pressStyle: 'box-shadow: 0px 0px 0px 0px;',
      isPlay: 1
    })
    this.noticePlay()
  },

  noticePlay: function () {
    if (this.data.isPlay == 0) {
      this.setData({
        playNotice: 1
      })
      return
    }
    console.log(this.data.playNotice)
    if (this.data.playNotice == 1) {
      this.setData({
        playNotice: 0.2
      })
    } else {
      this.setData({
        playNotice: 1
      })
    }
    setTimeout(this.noticePlay, 600)
  },

  stopRecord: function () {
    recorderManager.stop();
    this.setData({
      pressStyle: 'box-shadow: 0 2px 10px rgba(0, 49, 114, .5);',
      isPlay: 0
    })
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 3) {
      util.showModel('录音太短', '请录制一段超过3秒的语音');
      return
    }

      var that = this
      wx.showModal({
        title: '提示',
        content: '是否确定提交？',
        success: function (sm) {
          if (sm.confirm) {
            var evaluationAudioId = uuid.v1()
            setTimeout(that.saveAudio, 100, evaluationAudioId)
            
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
  },

  saveAudio: function (audioId) {
    util.showBusy('请求中...')
    var that = this
    console.log('tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (result) {
        var resultData = JSON.parse(result.data)
        that.saveAudioRecord(audioId, resultData.data)
      },

      fail: function (e) {
        console.error(e)
      }
    })
  },

  saveAudioRecord: function (evaluationAudioId, audioText) {
    var that =  this
    qcloud.request({
      url: `${config.service.host}/weapp/audio.audioComment`,
      login: true,
      data: { evaluationAudioId: evaluationAudioId, targetAudioId: this.data.audioId, timeDuration: timeDuration, audioType: 2, audioText: audioText },
      method: 'post',
      success(result) {
        if (that.data.audioData[0].isMine == 1){
          // innerAudioContext.src = audioService.coinSrc
          // innerAudioContext.play()
          coinPlay = 1
          wx.showToast({
            title: '完成复盘 +1',
            image: '../../../images/impromptuMeeting/money.png',
          })
        }else{
          wx.showToast({
            title: '完成鼓励 +1',
            image: '../../../images/impromptuMeeting/money.png',
          })
        }
       
        console.log(result)
        that.queryAudioComment()
        that.increaseCommentTime()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function (options) {
    this.initAudio()
    console.log(options)
    this.setData({
      audioId: options.audioId
    })
    queryPageType = 0
    this.queryAudioDetail()
    this.queryAudioComment()

    innerAudioContext.obeyMuteSwitch = false
    innerAudioContext.onPlay(() => {
      console.log('开始播放', innerAudioContext.currentTime)
      wx.hideLoading()
    })
    innerAudioContext.onWaiting(() => {
      //if (innerAudioContext.duration < 5) return
      //if (innerAudioContext.src == audioService.getSrc()) return
      wx.showLoading({
        title: '音频加载中',
      })
    })
    innerAudioContext.onError((res) => {
      //wx.hideLoading()
      //util.showNotice('音频加载失败')
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      this.formatDateAndStatus()
      this.setData({
        currentLikeUser: []
      })
    })
    innerAudioContext.onEnded((res) => {
      audioService.updatePlayDuration(innerAudioContext.duration, innerAudioContext)
      this.formatDateAndStatus()
      this.setData({
        currentLikeUser: []
      })
    })
  },

  initAudio: function () {
    recorderManager.onStop((res) => {
      tempFilePath = res.tempFilePath
    })

    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })
  },

  onUnload: function () {
    innerAudioContext.stop();
    //innerAudioContext.destroy()
  },

  editAudio: function (e) {
    var audioId = this.data.audioData[0].audio_id
    var audioName = this.data.audioData[0].audio_name
    var audioText = this.data.audioData[0].audio_text
    var isMine = this.data.audioData[0].isMine
    wx.navigateTo({
      url: '../../impromptu/myAudioManage/myAudioManage?audioId=' + audioId + '&audioName=' + audioName + '&audioText=' + audioText + '&isMine=' + isMine
    })
  },

  copyAudio: function(){
    wx.setClipboardData({
      data: this.data.audioData[0].src,
    })
  },

  onShow: function () {
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
   
  },

  onReady: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
    //wx.setNavigationBarTitle({ title: speechTypeArr[this.data.audioData[0].speech_type] });
  },

  onShareAppMessage: function (res) {
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: '请为我的' + speechTypeArr[this.data.audioData[0].speech_type] + '打call！',
    }
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.queryAudioComment()
  },

  toAudioDetail: function (e) {
    wx.navigateTo({
      url: '../audioDetail/audioDetail?audioId=' + e.currentTarget.dataset.audio_id,
    })
  },

  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id
    })
  },

})