var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

const innerAudioContext = wx.createInnerAudioContext()
var queryFlag = 0
var firstAudioTime = ''
var lastAudioTime = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    audios: {}
  },

  //查询最新房间信息
  queryImpromptuAudios: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.myAudio`,
      login: true,
      method: 'get',
      data: { queryFlag: queryFlag },
      success(result) {
        console.log('queryImpromptuAudios' , result)
        if (result.data.data == '') return;
        //util.showSuccess('请求成功完成')
        var resultData = []
        if (queryFlag == 0) {
          resultData = result.data.data
        } else if (queryFlag == 1) {
          resultData = [].concat(result.data.data, that.data.audios)
        } else if (queryFlag == 2) {
          resultData = [].concat(that.data.audios, result.data.data)
        }

        that.setData({
          audios: resultData
        })
        var length = that.data.audios.length
        firstAudioTime = that.data.audios[0].create_date
        lastAudioTime = that.data.audios[length - 1].create_date
        that.formatDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDateAndStatus: function (src) {
    var data = this.data.audios
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
    console.log(data)
    this.setData({
      audios: data
    })
  },

  editAudio: function(e){
    var audioId = e.currentTarget.dataset.audio_id
    var audioName = e.currentTarget.dataset.audio_name
    var audioText = e.currentTarget.dataset.audio_text
    wx.navigateTo({
      url: '../myAudioManage/myAudioManage?audioId=' + audioId + '&audioName=' + audioName + '&audioText=' + audioText
    })
  },

  playAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.autoplay = true
    innerAudioContext.src = src
    this.formatDateAndStatus(src)
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.stop()
    this.formatDateAndStatus()
  },

  onLoad: function (options) {
    this.queryImpromptuAudios()

    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      this.formatDateAndStatus()
    })
    innerAudioContext.onEnded((res) => {
      this.formatDateAndStatus()
    })
  },


  onPullDownRefresh: function () {
    queryFlag = 1
    this.queryImpromptuAudios()
  },

  onReachBottom: function () {
    queryFlag = 2
    this.queryImpromptuAudios()
  },

})