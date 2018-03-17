var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var roomId
var reportType
Page({
  data: {
    audioId: '',
    audioName: '',
    audioText: ''
  },


  modifyAudio: function (e) {
    console.log(e.detail.value)
    var requestData = e.detail.value
    requestData.audioId = this.data.audioId
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.myAudio`,
      data: requestData,
      login: true,
      method: 'put',
      success(result) {
        util.showSuccess('保存成功')
        wx.navigateTo({
          url: '../myAudio/myAudio',
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
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
        wx.navigateTo({
          url: '../myAudio/myAudio',
        })
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
      audioId: options.audioId,
      audioName: options.audioName,
      audioText: options.audioText
    })
  },

});