var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')
var queryAmount = 9
Page({

  /**
   * 页面的初始数据
   */
  data: {
    speechNames: [],
    index:0,
    evaluateLevel:0
  },

  evaluate: function(e){
    this.setData({
      evaluateLevel: e.currentTarget.dataset.star
    })
  },

  //完成任务
  evaluateSpeechName: function (e) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/speech.speechNameEvaluate`,
      data: { evaluateLevel: this.data.evaluateLevel, speechName:this.data.speechNames[this.data.index].speech_name },
      login: true,
      method: 'post',
      success(result) {
        util.showSuccess('点评成功')
        that.setData({
          evaluateLevel: 0
        })
        if(that.data.index == queryAmount){
          that.getSpeechNames()
        }else{
          var nextIndex = that.data.index + 1
          console.log('nextIndex', nextIndex)
          that.setData({
            index: nextIndex
          })
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //完成任务
  getSpeechNames: function (e) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/speech.speechNameEvaluate`,
      data: { evaluateLevel: this.data.evaluateLevel },
      login: true,
      method: 'get',
      success(result) {
        if(result.data.data == ''){
          util.showNotice('已经点评完所有题目')
          return
        }
        that.setData({
          speechNames : result.data.data
        })
        that.setData({
          index: 0
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad:function(){
    this.getSpeechNames()
  }

})