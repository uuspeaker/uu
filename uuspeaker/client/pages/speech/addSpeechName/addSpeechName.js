var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pastSpeechName:'',
    speechName:''
  },

  //完成任务
  saveSpeechName: function (e) {
    this.setData({
      pastSpeechName: e.detail.value,
      speechName:''
    })
    qcloud.request({
      url: `${config.service.host}/weapp/speech.speechNameInfo`,
      data: { speechName: e.detail.value},
      login: true,
      method: 'post',
      success(result) {
        if(result.data.data == 1){
          util.showSuccess('保存成功')
        }else{
          util.showSuccess('题目已经存在')
        }
        

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  toSpeechNameList: function () {
    wx.navigateTo({
      url: '../speechNameList/speechNameList',
    })
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '我要出题' });
  },

})