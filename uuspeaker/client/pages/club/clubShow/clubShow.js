var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')
const uuid = require('../../../common/uuid');

const recorderManager = wx.getRecorderManager()
var clubId = ''
var timeDuration = 0
var startDate
var endDate
var audioId = ''
var tempFilePath = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubName: '',
    isPlay:0
  },

  applyClub: function(){
    util.showBusy('保存中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubApply`,
      login: true,
      method: 'post',
      data: { clubId: clubId, audioId: audioId, timeDuration: timeDuration},
      success(result) {
        var applyResult = result.data.data
        wx.hideLoading()
        if (applyResult == 1){
          that.saveAudio()
        }else{
          util.showSuccess('已经在俱乐部中')
        }
        // wx.navigateBack({
        // })
       
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  startRecord: function () {
    this.setData({
      isPlay: 1
    })
    startDate = new Date()
    recorderManager.start(config.options)
  },

  //用户放开录音按钮
  stopRecord: function () {
    recorderManager.stop();
    this.setData({
      isPlay: 0
    })
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 3) {
      util.showModel('录音太短', '请录制一段超过10秒的语音');
      return
    }
    audioId = uuid.v1()
    wx.showModal({
      title: '提示',
      content: '是否发送此申请？',
      success: (sm) => {
        if (sm.confirm) {
          this.applyClub()
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },

  saveAudio: function () {
    var that = this
    console.log('tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (result) {
        util.showSuccess('申请成功')  
      },

      fail: function (e) {
        console.error(e)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    clubId = options.clubId
    this.setData({
      clubName : options.clubName
    })
    this.initAudio()
    
  },

  initAudio: function () {
    recorderManager.onStop((res) => {
      tempFilePath = res.tempFilePath
    })
  },

  onShareAppMessage: function (res) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  onReady: function(){
    wx.setNavigationBarTitle({
      title: '入会申请',
    })
  },

  
})