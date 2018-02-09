var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')

var roomId
Page({
  data: {
    speakerUser: [],
    evaluatorUser: []
  },

  speakerChange: function (e) {
    var meetingUser = this.data.speakerUser;
    for (var i = 0, len = meetingUser.length; i < len; ++i) {
      meetingUser[i].checked = meetingUser[i].value == e.detail.value;
    }
    this.setData({
      speakerUser: meetingUser
    });
  },

  evaluatorChange: function (e) {
    var meetingUser = this.data.evaluatorUser;
    for (var i = 0, len = meetingUser.length; i < len; ++i) {
      meetingUser[i].checked = meetingUser[i].value == e.detail.value;
    }
    this.setData({
      evaluatorUser: meetingUser
    });
  },

  vote: function (e) {
    var requestParam = e.detail.value
    requestParam.roomId = roomId
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuVote`,
      login: true,
      data: requestParam,
      method: 'post',
      success(result) {
        util.showSuccess('投票成功')
        wx.navigateBack({

        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  queryMeetingUser: function(roomId){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuSurvey`,
      login: true,
      data: {'roomId':roomId},
      method: 'get',
      success(result) {
        that.initMeetingUser(result.data.data)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  initMeetingUser: function(meetingUserStr){
    
    var meetingUserTmp = JSON.parse(meetingUserStr)
    console.log(meetingUserTmp)
    var meetingUser = []
    for (var i = 0; i < meetingUserTmp.length; i++){
      if(meetingUserTmp[i].checked == true){
        meetingUserTmp[i].checked = false
        meetingUser.push(meetingUserTmp[i])
      }
    }
    this.setData({
      speakerUser: meetingUser,
      evaluatorUser: meetingUser
    })
  },

  onLoad: function (options) {
    console.log(options)
    this.queryMeetingUser(options.roomId)
    roomId = options.roomId
  },

});