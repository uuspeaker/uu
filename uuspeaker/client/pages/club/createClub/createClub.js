var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var audioService = require('../../../common/audioService.js')
const uuid = require('../../../common/uuid');

const recorderManager = wx.getRecorderManager()
var timeDuration = 0
var startDate
var endDate
var audioId = ''
var tempFilePath = ''

var method = 'post'
Page({
  data: {
    userInfo: {},
    clubId: '',
    clubName: '',
    clubDescription: '',
    isPlay:0
  },

  createClub: function () {
    util.showBusy('保存中...')
    var clubName = this.data.clubName
    clubName = clubName.replace(/^\s+|\s+$/g, "");
    if (clubName == ''){
      util.showSuccess('请输入俱乐部名称')
      return
    }
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubInfo`,
      data: { clubId: this.data.clubId, clubName: this.data.clubName, clubDescription: this.data.clubDescription, audioId: audioId, timeDuration: timeDuration},
      login: true,
      method: method,
      success(result) {
        if (result.data.data == 1){
          that.saveAudio(1)
        }
        if (result.data.data == 2){
          that.saveAudio(2)
        }
        if (result.data.data == 9) {
          util.showSuccess('已经拥有俱乐部')
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  setClubName: function(e){
    var clubName = e.detail.value
    clubName = clubName.replace(/^\s+|\s+$/g, "");
    this.setData({
      clubName: clubName
    })
  },

  setClubDescription: function(e){
    this.setData({
      clubDescription: e.detail.value
    })
  },

  startRecord: function () {
    var clubName = this.data.clubName
    clubName = clubName.replace(/^\s+|\s+$/g, "");
    if (clubName == '') {
      util.showSuccess('请输入俱乐部名称')
      return
    }
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
      content: '是否保存？',
      success: (sm) => {
        if (sm.confirm) {
          this.createClub()
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  saveAudio: function (notice) {
    var that = this
    console.log('tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (result) {
        if(notice ==1){
        util.showSuccess('俱乐部创建成功')
        }
        if(notice ==2){
        util.showSuccess('俱乐部修改成功')
        }
        that.toMyClub()
      },

      fail: function (e) {
        console.error(e)
      }
    })
  },

  toClubList: function () {
    wx.navigateTo({
      url: '../../club/clubList/clubList',
    })
  },

  toMyClub: function () {
    wx.redirectTo({
      url: '../../club/myClub/myClub',
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

  onLoad: function (options) {
    console.log(options)
    if (options.operationType == 2){
      method = 'put'
      this.setData({
        clubId: options.clubId,
        clubName: options.clubName,
        clubDescription: options.clubDescription,
      })
    }
    this.initUserInfo()
    this.initAudio()
    
  },

  initAudio: function () {
    recorderManager.onStop((res) => {
      tempFilePath = res.tempFilePath
    })
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '创建俱乐部' });
  },

});