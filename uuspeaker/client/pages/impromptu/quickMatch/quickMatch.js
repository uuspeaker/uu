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
/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
  if (!msgUuid.next) {
    msgUuid.next = 0;
  }
  return 'msg-' + (++msgUuid.next);
}

/**
 * 生成聊天室的系统消息
 */
function createSystemMessage(content) {
  return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, isMe) {
  return { id: msgUuid(), type: 'speak', content, user, isMe };
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitSeconds: '',
    isMatching: 0,
    onlineUser: [],

    messages: [],
    inputContent: '大家好啊',
    lastMessageId: 'none',
  },

  enterMatchRoom: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.onlineUser`,
      login: true,
      method: 'post',
      success(result) {
        that.setData({
          onlineUser: result.data.data
        })

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },
  leaveMatchRoom: function () {
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

  startMatch: function () {
    util.showSuccess('开始匹配')
    this.setData({
      waitSeconds: 1,
      isMatching: 1
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickMatch`,
      login: true,
      method: 'post',
      success(result) {
        console.log('userId', result.data.data)
        userId = result.data.data
        getMatchInfoId = setInterval(that.getMatchInfo, 1000)
        //that.getMatchInfo()
        waitId = setInterval(that.wait, 1000)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  stopMatch: function () {
    clearInterval(getMatchInfoId)
    clearInterval(waitId)
    this.setData({
      waitSeconds: 0,
      isMatching: 0
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickMatch`,
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

  wait: function () {
    this.setData({
      waitSeconds: this.data.waitSeconds + 1
    })
    if (this.data.waitSeconds >= searchSeconds) {
      clearInterval(getMatchInfoId)
      clearInterval(waitId)
      util.showSuccess('未找到匹配用户')
      this.setData({
        waitSeconds: 0,
        isMatching: 0
      })
    }
  },

  getMatchInfo: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.quickMatch`,
      login: true,
      method: 'get',
      data: { 'userId': userId },
      success(result) {
        console.log('getMatchInfo', result.data.data)
        var userInfo = result.data.data
        if (userInfo == 0) {
          //util.showBusy('搜索中...')
        } else {
          clearInterval(getMatchInfoId)
          clearInterval(waitId)
          util.showSuccess('匹配成功')
          console.log('userInfo', userInfo)
          //setTimeout(that.createAndGoRoom, Math.random() * 5, userInfo)
          //Math.floor(Math.random() * 3)
          that.doGoRoom(userInfo)
        }

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  // 进入rtcroom页面
  doGoRoom: function (userInfo) {
    var url = '../quickMatchRoom/quickMatchRoom?roomId=' + userInfo.roomId + '&userId=' + userId + '&nickName=' + userInfo.matchedUser.nickName + '&avatarUrl=' + userInfo.matchedUser.avatarUrl + '&speechName=' + userInfo.speechName + '&matchUserId=' + userInfo.matchedUser.userId
      console.log(url)
      wx.navigateTo({
        url: url
      });
  },

  createAndGoRoom: function (roomId) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否准备就绪？',
      success: function (sm) {
        if (sm.confirm) {
          that.doGoRoom()
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 启动聊天室
   */
  enter1() {
    this.pushMessage(createSystemMessage('正在登录...'));

    // 如果登录过，会记录当前用户在 this.me 上
    if (!this.me) {
      qcloud.request({
        url: `https://${config.service.host}/user`,
        login: true,
        success: (response) => {
          this.me = response.data.data.userInfo;
          this.connect();
        }
      });
    } else {
      this.connect();
    }
  },

  /**
   * 连接到聊天室信道服务
   */
  enter() {
    this.amendMessage(createSystemMessage('正在加入群聊...'));

    // 创建信道
    var tunnel = this.tunnel = new qcloud.Tunnel(config.service.chatUrl);

    // 连接成功后，去掉「正在加入群聊」的系统提示
    tunnel.on('connect', () => this.popMessage());

    // 聊天室有人加入或退出，反馈到 UI 上
    tunnel.on('people', people => {
      const { total, enter, leave } = people;

      if (enter) {
        this.pushMessage(createSystemMessage(`${enter.nickName}已加入群聊，当前共 ${total} 人`));
      } else {
        this.pushMessage(createSystemMessage(`${leave.nickName}已退出群聊，当前共 ${total} 人`));
      }
    });

    // 有人说话，创建一条消息
    tunnel.on('speak', speak => {
      const { word, who } = speak;
      this.pushMessage(createUserMessage(word, who, who.openId === this.me.openId));
    });

    // 信道关闭后，显示退出群聊
    tunnel.on('close', () => {
      this.pushMessage(createSystemMessage('您已退出群聊'));
    });

    // 重连提醒
    tunnel.on('reconnecting', () => {
      this.pushMessage(createSystemMessage('已断线，正在重连...'));
    });

    tunnel.on('reconnect', () => {
      this.amendMessage(createSystemMessage('重连成功'));
    });

    // 打开信道
    tunnel.open();
  },

  /**
   * 退出聊天室
   */
  quit() {
    if (this.tunnel) {
      this.tunnel.close();
    }
  },

  /**
   * 通用更新当前消息集合的方法
   */
  updateMessages(updater) {
    var messages = this.data.messages;
    updater(messages);

    this.setData({ messages });

    // 需要先更新 messagess 数据后再设置滚动位置，否则不能生效
    var lastMessageId = messages.length ? messages[messages.length - 1].id : 'none';
    this.setData({ lastMessageId });
  },

  /**
   * 追加一条消息
   */
  pushMessage(message) {
    this.updateMessages(messages => messages.push(message));
  },

  /**
   * 替换上一条消息
   */
  amendMessage(message) {
    this.updateMessages(messages => messages.splice(-1, 1, message));
  },

  /**
   * 删除上一条消息
   */
  popMessage() {
    this.updateMessages(messages => messages.pop());
  },

  /**
   * 用户输入的内容改变之后
   */
  changeInputContent(e) {
    this.setData({ inputContent: e.detail.value });
  },

  /**
   * 点击「发送」按钮，通过信道推送消息到服务器
   **/
  sendMessage(e) {
    // 信道当前不可用
    if (!this.tunnel || !this.tunnel.isActive()) {
      this.pushMessage(createSystemMessage('您还没有加入群聊，请稍后重试'));
      if (this.tunnel.isClosed()) {
        this.enter();
      }
      return;
    }

    setTimeout(() => {
      if (this.data.inputContent && this.tunnel) {
        this.tunnel.emit('speak', { word: this.data.inputContent });
        this.setData({ inputContent: '' });
      }
    });
  },

  onLoad:function(options){
    if(options.start == 1){
      this.startMatch()
    }
  },

  onReady() {
    if (!this.pageReady) {
      this.pageReady = true;
      this.enter();
    }
  },

  onShow() {
    if (this.pageReady) {
      this.enter();
    }
  },


  onHide: function () {
    this.quit()
    //this.leaveMatchRoom()
    if (this.data.isMatching == 1) {
      this.stopMatch()
    } else {
      //this.leaveMatchRoom()
    }

  },

  onUnload: function () {
    this.quit()
    //this.leaveMatchRoom()
    if (this.data.isMatching == 1) {
      this.stopMatch()
    } else {
      //this.leaveMatchRoom()
    }
  },

})