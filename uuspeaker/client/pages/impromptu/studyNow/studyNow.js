var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var getlogininfo = require('../../../getlogininfo.js')

var roomId = ''
var getMatchInfoId = ''
var waitId = ''
var userId = ''
var searchSeconds = 30
var isMatch = 0
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
        getMatchInfoId = setInterval(that.getMatchInfo,2000)
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
    //if (isMatch ==1)return
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
          isMatch = 1
          clearInterval(getMatchInfoId)
          clearInterval(waitId)
          util.showSuccess('匹配成功')
          console.log('roomId', roomId)
          setTimeout(that.createAndGoRoom, Math.random() * 5, roomId)
          //Math.floor(Math.random() * 3)
          //that.createAndGoRoom(roomId)
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  // 进入rtcroom页面
  createAndGoRoom: function (roomId) {
    var self = this;
    qcloud.request({
      url: `${config.service.host}/weapp/multi_room.isRoomExist`,
      login: true,
      data: { 'roomId': roomId },
      method: 'post',
      success(result) {
        console.log('multi_room.isRoomExist')
        console.log(result)
        var isRoomExist = result.data.isRoomExist
        var enterType = 'create'
        if (isRoomExist) {
          enterType = 'enter'
        }
        var url = '../room/room?type=' + enterType + '&roomName=快速匹配&roomID=' + roomId + '&userId=' + userId
        console.log(url)
        //var url = '../room/room?type=' + enterType + '&roomName=' + '快速匹配' + '&roomID=' + roomID + '&userId=' + self.data.roomInfo.user_id
        console.log(url)
        wx.navigateTo({
          url: url
        });
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

  onReady: function () {
    var self = this;
    //this.getRoomList(function () { });
    getlogininfo.getLoginInfo({
      type: 'multi_room',
      success: function (ret) {
      },
      fail: function (ret) {
        wx.hideLoading();
        wx.showModal({
          title: '获取登录信息失败',
          content: ret.errMsg,
          showCancel: false,
          complete: function () {
            wx.navigateBack({});
          }
        });
      }
    });
  },
})