var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioDataervice = require('../../../common/audioService.js')
const uuid = require('../../../common/uuid');

const innerAudioContext = wx.createInnerAudioContext()
var startDate
var endDate
var timeDuration = 0

//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    audioId: '',
    audioData:[],
    audioDataLike:[],
    likeIt: 0,
    audioDataComment:[]
  },

  //查询最新房间信息
  queryAudioDetail: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.audioDetail`,
      login: true,
      method: 'get',
      data: { audioId: this.data.audioId },
      success(result) {
        console.log(result)
        that.setData({
          audioData: result.data.data.audioData,
          audioDataLike: result.data.data.audioDataLike,
          likeIt: result.data.data.likeIt,
        })
        that.formatDateAndStatus()
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
    this.setData({
      audioData: audioData,
      audioDataLike: audioDataLike
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
    innerAudioContext.autoplay = true
    innerAudioContext.src = src
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

  updateViewAmount: function (audioId, viewType) {
    var data = this.data.audioData
    for (var i = 0; i < data.length; i++) {
        data[i].view_amount = data[i].view_amount + 1
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
    audioDataervice.start()
    startDate = new Date()
  },

  stopRecord: function () {
    audioDataervice.stop()
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 1) {
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
            setTimeout(audioDataervice.saveAudio, 300, evaluationAudioId)
            that.saveAudioRecord(evaluationAudioId)
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
  },

  saveAudioRecord: function (evaluationAudioId) {
    var that =  this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userTask`,
      login: true,
      data: { evaluationAudioId: evaluationAudioId, taskAudioId:this.data.audioId,timeDuration: timeDuration, audioType: 2 },
      method: 'put',
      success(result) {
        console.log(result)
        that.queryAudioDetail()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function (options) {
    console.log(options)
    this.setData({
      audioId: options.audioId
    })
    innerAudioContext.onPlay(() => {
      console.log('开始播放', innerAudioContext.currentTime)
    })
    innerAudioContext.onError((res) => {
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
      this.formatDateAndStatus()
      this.setData({
        currentLikeUser: []
      })
    })
  },

  onShow: function (options) {
    queryPageType = 0
    this.queryAudioDetail()
    this.queryAudioComment()
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

})