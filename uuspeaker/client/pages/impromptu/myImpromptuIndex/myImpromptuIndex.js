var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
var rtcroom = require('../../../utils/rtcroom.js');
var getlogininfo = require('../../../getlogininfo.js');

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["我发起的", "我参与的"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    viewStyle: [],
    textStyle: [],
    myRooms: [],
    myJoinRooms: [],
    userName: '',
    modeItems: ['即兴演讲', '备稿演讲', '工作坊'],
    languageItems: ['中文', 'English'],
    tapTime: ''
  },

  initViewStyle: function () {
    var initViewStyle = new Array(10)
    for (var i = 0; i < initViewStyle.length; i++) {
      initViewStyle[i] = 'box-shadow: 1px 1px 2px 2px #888888;'
    }
    this.setData({
      viewStyle: initViewStyle
    })
  },

  pressView: function (e) {
    this.initViewStyle()
    var index = e.currentTarget.dataset.item
    var tmpViewStyle = this.data.viewStyle
    tmpViewStyle[index] = 'box-shadow:0px 0px 0px 0px'
    this.setData({
      viewStyle: tmpViewStyle
    })
    var that = this
    //setTimeout(this.initViewStyle, 200);
  },

  //查询最新房间信息
  queryImpromptuRooms: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.myImpromptuRoom`,
      login: true,
      method: 'get',
      success(result) {
        that.setData({
          myRooms: result.data.data.myRooms,
          myJoinRooms: result.data.data.myJoinRooms,
        })
        //将时间格式化显示
        that.formatDate()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDate: function () {
    var myRoomData = this.data.myRooms
    for (var i = 0; i < myRoomData.length; i++) {
      myRoomData[i].startDateStr = dateFormat.getTimeNoticeFuture(myRoomData[i].start_date, myRoomData[i].start_time)
      myRoomData[i].timeStatus = dateFormat.getTimeStatus(myRoomData[i].start_date, myRoomData[i].start_time, myRoomData[i].end_time)
    }
    
    this.setData({
      myRooms: myRoomData
    })

    var myJoinRoomData = this.data.myJoinRooms
    for (var i = 0; i < myJoinRoomData.length; i++) {
      var myJoinRoomData = this.data.myJoinRooms
      var myJoinRoomData = this.data.myJoinRooms
      myJoinRoomData[i].startDateStr = dateFormat.getTimeNoticeFuture(data[i].start_date, data[i].start_time)
      myJoinRoomData[i].timeStatus = dateFormat.getTimeStatus(myJoinRoomData[i].start_date, myJoinRoomData[i].start_time, myJoinRoomData[i].end_time)
    }
    this.setData({
      myJoinRooms: myJoinRoomData
    })
  },

  toImpromptuMeeting: function (e) {
    var roomId = e.currentTarget.dataset.room_id
    var userId = e.currentTarget.dataset.user_id

    wx.navigateTo({
      url: '../impromptuMeeting/impromptuMeeting?' + '&roomId=' + e.currentTarget.dataset.room_id
    })
  },

  openImpromptuRoom: function () {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=add'
    })
  },

  updateImpromptuRoom: function (e) {
    wx.navigateTo({
      url: '../impromptuRoom/impromptuRoom?operation=modify'
      + '&roomId=' + e.currentTarget.dataset.room_id
      + '&startDate=' + e.currentTarget.dataset.start_date
      + '&startTime=' + e.currentTarget.dataset.start_time
      + '&endTime=' + e.currentTarget.dataset.end_time
      + '&mode=' + e.currentTarget.dataset.mode
      + '&language=' + e.currentTarget.dataset.language
      + '&notice=' + e.currentTarget.dataset.notice
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  onShow: function (options) {
    this.initViewStyle()
    this.queryImpromptuRooms()

  },

  onPullDownRefresh: function () {
    this.initViewStyle()
    this.queryImpromptuRooms()
  },

  onReady: function () {
    var self = this;
    //this.getRoomList(function () { });
    getlogininfo.getLoginInfo({
      type: 'multi_room',
      success: function (ret) {
        self.data.firstshow = false;
        self.data.isGetLoginInfo = true;
        //self.getRoomList(function () { });
        console.log('我的昵称：', ret.userName);
        self.setData({
          userName: ret.userName
        });
        wx.hideLoading();
      },
      fail: function (ret) {
        self.data.isGetLoginInfo = false;
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