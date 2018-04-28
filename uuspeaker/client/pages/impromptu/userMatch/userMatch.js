var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var getlogininfo = require('../../../getlogininfo.js')

var roomId = ''
var getMatchInfoId = ''
var waitId = ''
var enterIntervalId = ''
var userId = ''
var searchSeconds = 30
var hasEnter = 0
var tryTimes = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitSeconds:'',
    isMatching:0,
    onlineUser:[]
  },

  enterMatchRoom: function(){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.onlineUser`,
      login: true,
      method: 'post',
      success(result) {
        that.setData({
          onlineUser : result.data.data
        })
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },
  leaveMatchRoom: function(){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.onlineUser`,
      login: true,
      method: 'put',
      success(result) {
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  startMatch: function(){
    util.showSuccess('开始匹配')
    this.setData({
      waitSeconds: 1,
      isMatching:1
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userMatch`,
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

  stopMatch: function(){
    clearInterval(getMatchInfoId)
    clearInterval(waitId)
    this.setData({
      waitSeconds: 0,
      isMatching:0
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userMatch`,
      login: true,
      method: 'put',
      success(result) {
        
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
        waitSeconds: 0,
        isMatching:0
      })
    }
  },

  getMatchInfo: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userMatch`,
      login: true,
      method: 'get',
      data: { 'userId': userId},
      success(result) {
        console.log('getMatchInfo', result.data.data)
        var userInfo = result.data.data
        if (userInfo == 0){
          //util.showBusy('搜索中...')
        }else{
          clearInterval(getMatchInfoId)
          clearInterval(waitId)
          util.showSuccess('匹配成功')
          console.log('roomId', roomId)
          //setTimeout(that.createAndGoRoom, Math.random() * 5, userInfo)
          //Math.floor(Math.random() * 3)
          that.createAndGoRoom(userInfo)
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  // 进入rtcroom页面
  createAndGoRoom: function (userInfo) {
    roomId = userInfo.roomId
    if (userInfo.enterType == 'create'){
      var url = '../room/room?type=create&roomName=快速匹配&roomID=' + roomId + '&userId=' + userId
      console.log(url)
      wx.navigateTo({
        url: url
      });
    }
    if (userInfo.enterType == 'enter') {
      //setTimeout(this.enterImpromptuRoom,3000,roomId)
      enterIntervalId = setInterval(this.checkRoomToEnter, 1 * 1000);
    }
  },

  enterImpromptuRoom: function (){
    var url = '../room/room?type=enter&roomName=快速匹配&roomID=' + roomId + '&userId=' + userId
    console.log(url)
    wx.navigateTo({
      url: url
    });
  },

  checkRoomToEnter: function(){
    tryTimes++
    if (hasEnter == 1 || tryTimes > 5){
      clearInterval(enterIntervalId)
      tryTimes = 0
      return
    }
    console.log('roomId', roomId)
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
        if (isRoomExist && tryTimes <=5){
          hasEnter = 1
          self.enterImpromptuRoom()
          return
        }
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  onLoad: function(){

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

  onShow: function(){
    this.enterMatchRoom()
  },

  onHide: function () {
    this.leaveMatchRoom()
    if (this.data.isMatching == 1) {
      this.stopMatch()
    } else {
      this.leaveMatchRoom()
    }
    
  },

  onUnload: function () {
    this.leaveMatchRoom()
    if (this.data.isMatching == 1) {
      this.stopMatch()
    }else{
      this.leaveMatchRoom()
    }
  },
  
})