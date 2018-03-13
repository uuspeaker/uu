var rtcroom = require('../../../utils/rtcroom.js');
var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var memberSize = 9
var queryFlag = 0
var firstCommentTime = ''
var lastCommentTime = ''

const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext();

const options = {
  duration: 600000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    role: 'enter',      // 表示双人会话的角色，取值'enter'表示加入者，'create'表示创建者
    roomid: '',         // 房间id
    roomname: '',       // 房间名称
    username: '',       // 用户名称
    config: {           //cameraview对应的配置项
      //aspect: '3:4',     //设置画面比例，取值为'3:4'或者'9:16'
      minBitrate: 200,   //设置码率范围为[minBitrate,maxBitrate]，四人建议设置为200~400
      maxBitrate: 1000,
      beauty: 1,        //美颜程度，取值为0~9
      muted: false,     //设置推流是否静音
      debug: false,     //是否显示log
      camera: true,     //设置前后置摄像头，true表示前置
      enableCamera: false, //开启摄像头
      operate: ''       //设置操作类型，目前只有一种'stop'，表示停止
    },
    styles: {           //设置cameraview的大小
      // width: '49vw',
      // height: '65.33vw'
      //width: '32vw',
      //height: '40vw'
    },
    userInfo: {},
    dialog: [],
    comment: '',
    event: 0,               //推流事件透传
    isTop: 0,
    speakNotice: 'speak',
    userPicNotice: 'user-pic',
    members: [{}, {}, {}, {}, {}, {}, {}, {}, {}],  //多人其他用户信息
    isShow: false,          // 是否显示页面
    exit: 0
  },
  /**
  * 通知事件
  * onGetMemberList：初始化成员列表
  * onMemberJoin：有人进群通知
  * onMemberQuit：有人退群通知
  * onRoomClose：房间解散通知
  * onFail：错误回调
  */
  onNotify: function (e) {
    var self = this;
    switch (e.detail.type) {
      case 'onRecvRoomTextMsg': {
        console.log('onRecvRoomTextMsg')
        console.log(e)
        if (e.detail.content.headPic != undefined) {
          var self = this;
          var isMine = 0
          if (e.detail.content.headPic == self.data.userInfo.avatarUrl) {
            isMine = 1
          }
          self.data.dialog.push({
            comment: e.detail.content.textMsg,
            user_info: { 'nickName': e.detail.content.nickName, 'avatarUrl': e.detail.content.headPic },
            //create_date: e.detail.content.time,
            isMine: isMine
          });
          console.log(self.data.dialog)
          self.setData({
            dialog: self.data.dialog,
          });
          self.formatDate()
        }
        break
      }
      case 'onGetMemberList': {
        /*
          进入房间后，房间内目前已经有哪些用户通过此通知返回，可以根据此通知来展示其他用户视频信息，
          e.detail.members：表示其他用户列表信息
        */
        // 拿到成员信息先判断成员数目，房间人数已满立即退出
        console.log('房间人数:', e.detail.members.length);
        if (e.detail.members.length > memberSize) {
          self.onNotify({
            detail: {
              type: 'onFail',
              errMsg: '房间人数已满'
            }
          });
          break;
        }
        e.detail.members.forEach(function (val) {
          val.loading = false;
          val.playerContext = wx.createLivePlayerContext(val.userID);

        });
        for (var i = 0; i < memberSize; i++) {
          if (e.detail.members[i]) {
            self.data.members[i] = e.detail.members[i];
            self.data.members[i].userPicMode = 'user-pic-speak'
            self.data.members[i].muted = 0
          }
        }
        // 页面处于隐藏时候不触发渲染
        self.data.isShow && self.setData({ members: self.data.members });
        break;
      }
      case 'onMemberJoin': {
        /*
          当有新的用户进入时会通知出来，可以根据此通知来展示新进入用户信息
          e.detail.members：表示新进入用户列表信息
        */
        e.detail.members.forEach(function (val) {
          val.loading = false;
          val.playerContext = wx.createLivePlayerContext(val.userID);
          for (var i = 0; i < memberSize; i++) {
            if (!self.data.members[i].userID) {
              self.data.members[i] = val;
              self.data.members[i].userPicMode = 'user-pic-speak'
              self.data.members[i].muted = 0
              break;
            }
          }
        });
        // 页面处于隐藏时候不触发渲染
        self.data.isShow && self.setData({ members: self.data.members });
        break;
      }
      case 'onMemberQuit': {
        /*
          当有用户退出时会通知出来
          e.detail.members：表示退出用户列表信息
        */
        e.detail.members.forEach(function (val) {
          for (var i = 0; i < memberSize; i++) {
            if (self.data.members[i].userID == val.userID) {
              self.data.members[i] = {};
            }
          }
        });
        // 页面处于隐藏时候不触发渲染
        self.data.isShow && self.setData({ members: self.data.members });
        break;
      }
      case 'onRoomClose': {
        /*
          房间关闭时会收到此通知，客户可以提示用户房间已经关闭，做清理操作
        */
        self.data.config.operate = 'stop';
        self.setData({
          config: self.data.config
        });
        self.data.members.forEach(function (val) {
          val.playerContext && val.playerContext.stop();
        });
        // 在房间内部才显示提示
        var pages = getCurrentPages();
        console.log(pages, pages.length, pages[pages.length - 1].__route__);
        if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/impromptu/room/room')) {
          wx.showModal({
            title: '提示',
            content: e.detail.errMsg || '房间已解散',
            showCancel: false,
            complete: function () {
              pages = getCurrentPages();
              console.log(pages, pages.length, pages[pages.length - 1].__route__);
              if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/impromptu/room/room')) {
                wx.navigateBack({ delta: 1 });
              }
            }
          });
        }
        break;
      }
      case 'onFail': {
        /*
          收到房间用户的消息通知
          e.detail.content.textMsg：表示消息内容、
          e.detail.content.nickName：表示用户昵称
          e.detail.content.time：表示消息的接收时间
        */
        self.data.config.operate = 'stop';
        self.setData({
          config: self.data.config
        });
        self.data.members.forEach(function (val) {
          val.playerContext && val.playerContext.stop();
        });
        // 5000不弹提示
        if (e.detail.errCode == 5000) {
          self.data.exit = 5000;
          break;
        }

        // 在房间内部才显示提示
        var pages = getCurrentPages();
        console.log(pages, pages.length, pages[pages.length - 1].__route__);
        if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/impromptu/room/room')) {
          wx.showModal({
            title: '提示',
            content: e.detail.errMsg,
            showCancel: false,
            complete: function () {
              pages = getCurrentPages();
              if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/impromptu/room/room')) {
                wx.navigateBack({ delta: 1 });
              }
            }
          });
        }
        break;
      }
    }
  },
  onPush: function (e) {
    this.setData({ event: e.detail.code });
  },
  onPlay: function (e) {
    var self = this;
    self.data.members.forEach(function (val) {
      if (e.currentTarget.id == val.userID) {
        switch (e.detail.code) {
          case 2007: {
            console.log('播放loading: ', e);
            val.loading = true;
            break;
          }
          case 2004: {
            console.log('播放开始: ', e);
            val.loading = false;
            break;
          }
          case 2005: {
            console.log('播放中: ', e);
            // val.speakNotice = 'speak'
            // self.setData({
            //   members: self.data.members
            // })
            // setTimeout(self.keepSilence, 200, val.userID)
            break;
          }
          default: {
            console.log('拉流情况：', e);
          }
        }
      }
    });

  },

  keepSilence: function (userId) {
    var self = this
    self.data.members.forEach(function (val) {
      if (userId == val.userID) {
        val.speakNotice = 'silence'
      }
    })
    self.setData({
      members: self.data.members
    })
  },

  setSilent: function (e) {
    var userAvatar = e.currentTarget.dataset.user_avatar
    var self = this
    self.data.members.forEach(function (val) {
      if (userAvatar == val.userAvatar) {
        //若原来是静音,则点击后打开声音且将用户图片设置为全展示
        if (val.muted) {
          val.userPicMode = 'user-pic-speak'
          val.muted = 0
          //val.playerContext.mute(false)
        } else {
          val.userPicMode = 'user-pic-silent'
          val.muted = 1
          //val.playerContext.mute(true)
        }
        self.setData({
          members: self.data.members
        })
        return
      }
    })
  },

  changeMute: function () {
    this.data.config.muted = !this.data.config.muted;
    this.setData({
      config: this.data.config
    });
  },
  showLog: function () {
    this.data.config.debug = !this.data.config.debug;
    this.setData({
      config: this.data.config
    });
  },

  queryDialog: function (e) {
    var that = this
    var queryData = { 'queryFlag': queryFlag, 'firstCommentTime': firstCommentTime, 'lastCommentTime': lastCommentTime, 'roomId': this.data.roomid }
    console.log(queryData)
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuDialog`,
      data: queryData,
      login: true,
      method: 'get',
      success(result) {
        if (result.data.data == '') {
          that.setData({
            isTop: 1
          })
          return
        }
        console.log(result)
        var resultData = []
        if (queryFlag == 0) {
          resultData = result.data.data
        } else if (queryFlag == 1) {
          resultData = [].concat(result.data.data, that.data.dialog)
        } else if (queryFlag == 2) {
          resultData = [].concat(that.data.dialog, result.data.data)
        }
        that.setData({
          dialog: resultData
        })
        //将时间格式化显示
        that.formatDate()
        that.refreshCommentId()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDate: function () {
    var data = this.data.dialog
    for (var i = 0; i < data.length; i++) {
      var createDate = new Date(data[i].create_date)
      data[i].createDateStr = dateFormat.getTimeNotice(createDate)
    }
    this.setData({
      dialog: data
    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshCommentId: function () {
    var length = this.data.dialog.length
    firstCommentTime = this.data.dialog[0].create_date
    lastCommentTime = this.data.dialog[length - 1].create_date
  },

  toBottom: function () {
    wx.pageScrollTo({
      scrollTop: Number.MAX_SAFE_INTEGER,
      duration: 300
    })
  },

  saveComment: function (e) {
    console.log('saveComment')
    console.log(e)
    var requestData = {
      comment: e.detail.value,
      roomId: this.data.roomid
    }
    rtcroom.sendRoomTextMsg({ 'data': { 'msg': requestData.comment } })
    this.setData({
      comment: ''
    })

    console.log(requestData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuDialog`,
      data: requestData,
      login: true,
      method: 'post',
      success(result) {
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  updateDialog: function (comment) {
    var newComment = {}
    newComment.user_info = this.data.userInfo
    newComment.comment = comment
    newComment.isMine = 1
    this.data.dialog.push(newComment)
    this.setData({
      dialog: this.data.dialog
    })
    that.formatDate()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('room.js onLoad');
    console.log(options)
    var time = new Date();
    time = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
    console.log('*************开始多人音视频：' + time + '**************');
    this.data.role = options.type;
    this.data.roomid = options.roomID;
    this.data.roomname = options.roomName;
    //this.data.username = options.userName;
    this.setData({
      role: this.data.role,
      roomid: this.data.roomid,
      roomname: this.data.roomname,
      //username: this.data.username
    });
    this.initUserInfo()
    this.initAudio()
    // queryFlag = 0
    // this.queryDialog()
  },

  initAudio: function(){
    recorderManager.onStart(() => {
      console.log('recorder start')
    })
    recorderManager.onResume(() => {
      console.log('recorder resume')
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
    })
    recorderManager.onStop((res) => {
      var that = this
      console.log('recorder stop', res)
      var now =  new Date()
      var audioName = dateFormat.format(now, 'yyyy-MM-dd hh:mi:ss')
      wx.uploadFile({
        url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
        filePath: res.tempFilePath,
        name: 'file',
        formData: { roomId: this.data.roomid, audioName: audioName},
        success: function (res) {
          that.showSuccess('上传音频成功')
          res = JSON.parse(res.data)
          console.log(res)
        },

        fail: function (e) {
          console.error(e)
        }
      })
    })
    // 显示成功提示
    
    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })
  },

  showSuccess: function (text){
    wx.showToast({
      title: text,
      icon: 'success'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    // 设置房间标题
    wx.setNavigationBarTitle({ title: self.data.roomname });
  },

  // onRecvRoomTextMsg: function (ret) {
  //   console.log('onRecvRoomTextMsg')
  //   console.log(ret)
  //   var self = this;
  //   var newDialog = self.data.dialog.push({
  //     comment: ret.textMsg,
  //     user_info: { 'nickName': ret.nickName, 'avatarUrl': ret.headPic},
  //     create_date: ret.time
  //   });
  //   self.setData({
  //     dialog: newDialog,
  //   });
  // },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    queryFlag = 0
    firstCommentTime = ''
    lastCommentTime = ''
    this.queryDialog()
    var self = this;
    console.log('room.js onShow');
    // 点圈圈退出
    if (self.data.exit == 5000) {
      self.data.members.forEach(function (val) {
        val.playerContext && val.playerContext.stop();
      });
      wx.showModal({
        title: '提示',
        content: '你已退出',
        showCancel: false,
        complete: function () {
          var pages = getCurrentPages();
          console.log(pages, pages.length, pages[pages.length - 1].__route__);
          if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/impromptu/room/room')) {
            wx.navigateBack({ delta: 1 });
          }
        }
      });
      return;
    }
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    })

    self.data.isShow = true;
    self.setData({
      members: self.data.members
    });
  },

  initUserInfo: function () {
    var that = this
    wx.getUserInfo({
      withCredentials: false,
      lang: '',
      success(result) {
        that.setData({
          username: result.userInfo.nickName,
          userInfo: result.userInfo
        })
      },
      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      },
      complete: function (res) {

      },
    })
  },

  start: function () {
    recorderManager.start(options)
  },

  stop: function () {
    recorderManager.stop();
  },

  play: function () {
    innerAudioContext.autoplay = true
    innerAudioContext.src = tempFilePath,
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var self = this;
    console.log('room.js onHide');
    self.data.isShow = false;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('room.js onUnload');
  },

  onPullDownRefresh: function () {
    if (this.data.isTop == 1) return;
    queryFlag = 1
    this.queryDialog()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '多人音视频',
      path: '/pages/impromptu/roomlist/roomlist',
      imageUrl: '/pages/Resources/share.png'
    }
  }
})