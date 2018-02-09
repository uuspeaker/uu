var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')

var roomId
Page({
  data: {
    userItems: []
  },
  
  checkboxChange: function (e) {
    var userItems = this.data.userItems, values = e.detail.value;
    for (var i = 0, lenI = userItems.length; i < lenI; ++i) {
      userItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (userItems[i].value == values[j]) {
          userItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      userItems: userItems
    });
  },

  startSurvey: function(e){
    var selectUser = false
    var userItems = this.data.userItems
    for (var i = 0; i < userItems.length; i++) {
      if(userItems[i].checked == true){
        selectUser = true
        continue
      }
    }
    if (!selectUser){
      util.showSuccess('请选择要参会人员')
      return
    }
    var requestParam = JSON.stringify(this.data.userItems)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuSurvey`,
      login: true,
      data: {'meetingUser':requestParam,roomId: roomId},
      method: 'post',
      success(result) {
        util.showSuccess('已发起投票')
        wx.navigateBack({
          
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function(options){
    roomId = options.roomId
    var meetingUser = JSON.parse(options.meetingUser)
    var userItems = new Array(meetingUser.length)
    for(var i=0; i<meetingUser.length; i++){
      userItems[i] = { 
        name: meetingUser[i].user_info.nickName, 
        value: meetingUser[i].user_info.userId, 
        avatarUrl: meetingUser[i].user_info.avatarUrl,
        checked: true }
    }
    this.setData({
      userItems: userItems
    })
   
  },
  
});