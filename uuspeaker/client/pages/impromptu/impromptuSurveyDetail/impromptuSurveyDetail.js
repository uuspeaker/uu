var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')

var roomId
Page({
  data: {
    speakerUser: [],
    evaluatorUser: [],
    surveyStatus:''
  },

  queryMeetingUser: function (roomId) {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuSurvey`,
      login: true,
      data: { 'roomId': roomId },
      method: 'get',
      success(result) {
        that.setData({
          speakerUser: result.data.data,
          evaluatorUser: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  completeVote: function(){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuSurvey`,
      login: true,
      data: { 'roomId': roomId },
      method: 'put',
      success(result) {
        util.showSuccess('投票完成')
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  

  onLoad: function (options) {
    console.log(options)
    this.queryMeetingUser(options.roomId)
    roomId = options.roomId
    this.setData({
      surveyStatus: options.surveyStatus
    })
  },

});