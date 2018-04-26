var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var roomId = ''
var getMatchInfoId = ''
var waitId = ''
var userId = ''
var searchSeconds = 30
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitSeconds:99
  },

  startMatch: function(){
    util.showSuccess('开始匹配')
    this.setData({
      waitSeconds: 1
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.studyNow`,
      login: true,
      method: 'post',
      success(result) {
        console.log('userId',result.data.data)
        userId = result.data.data
        getMatchInfoId = setInterval(that.getMatchInfo,3000)
        //that.getMatchInfo()
        waitId = setInterval(that.wait, 1000)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  wait: function(){
    this.setData({
      waitSeconds: this.data.waitSeconds + 1
    })
    if (this.data.waitSeconds >= searchSeconds){
      clearInterval(getMatchInfoId)
      clearInterval(waitId)
      util.showSuccess('未找到匹配用户')
      this.setData({
        waitSeconds: 0
      })
    }
  },

  getMatchInfo: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.studyNow`,
      login: true,
      method: 'get',
      data: { 'userId': userId},
      success(result) {
        console.log('getMatchInfo', result.data.data)
        roomId = result.data.data
        if (roomId == 0){
          //util.showBusy('搜索中...')
        }else{
          clearInterval(getMatchInfoId)
          clearInterval(waitId)
          util.showSuccess('匹配成功')
          console.log('roomId', roomId)
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function(){
    this.startMatch()
  },
})