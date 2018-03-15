var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

const innerAudioContext = wx.createInnerAudioContext()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    audios: {},
    roomId: ''
  },

  //查询最新房间信息
  queryImpromptuAudios: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      method: 'get',
      data: { roomId: this.data.roomId},
      success(result) {
        console.log(result)
        that.setData({
          audios: result.data.data
        })
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
      if(data[i].src == src){
        data[i].isPlay = 1
      }else{
        data[i].isPlay = 0
      }
      
    }
    console.log(data)
    this.setData({
      audios: data
    })
  },

  playAudio: function(e){
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
    console.log(options)
    this.setData({
      roomId: options.roomId
    })
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

})