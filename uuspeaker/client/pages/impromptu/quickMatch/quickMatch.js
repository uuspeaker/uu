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
var thisUserInfo = {}
var rank
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
    userInfo:{},
    userList:[],
    infoType:1,

    messages: [],
    inputContent: '',
    lastMessageId: 'none',
    userAmount: 0,
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
          thisUserInfo = userInfo
          //setTimeout(that.createAndGoRoom, Math.random() * 5, userInfo)
          //Math.floor(Math.random() * 3)
          that.quit()
          //setTimeout(that.doGoRoom,5000)
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
    userInfo = thisUserInfo
    console.log('关闭信道，进入即兴演讲页面')
    var url = '../quickMatchRoom/quickMatchRoom?roomId=' + userInfo.roomId + '&userId=' + userId + '&nickName=' + userInfo.matchedUser.nickName + '&avatarUrl=' + userInfo.matchedUser.avatarUrl + '&speechName=' + userInfo.speechName + '&matchUserId=' + userInfo.matchedUser.userId
      console.log(url)
      wx.navigateTo({
        url: url
      });
  },


  /**
   * 连接到聊天室信道服务
   */
  openTunnel() {
    //this.amendMessage(createSystemMessage('正在加入学习频道...'));
    console.log('rank', rank)
    // 创建信道
    var tunnel = this.tunnel = new qcloud.Tunnel(`${config.service.host}/weapp/impromptu.meetingUrl?rank=` + rank)
    console.log('quickMatch 初始化信道服务',tunnel)
    // if (this.tunnel) {
    //   tunnel = this.tunnel
    // } else {
    //   tunnel = this.tunnel = new qcloud.Tunnel(config.service.chatUrl)
    // }

    // 连接成功后，去掉「正在加入学习频道」的系统提示
    tunnel.on('connect', () => {
      console.log('quickMatch 信道已连接')
      //this.popMessage()
      });

    // 连接成功后，去掉「正在加入学习频道」的系统提示
    tunnel.on('userList', (userList) => {
      const { data } = userList;
      this.setData({
        userList: data, 
        userAmount: Object.getOwnPropertyNames(data).length

      })
      });

    // 聊天室有人加入或退出，反馈到 UI 上
    tunnel.on('people', people => {
      const { total, enter, leave } = people;
      console.log('enter', enter)
      if(enter.openId != this.data.userInfo.openId){
        this.data.userList[enter.openId] = enter
        var totalAmount = Object.getOwnPropertyNames(this.data.userList).length
        this.setData({
          userList: this.data.userList,
          userAmount: totalAmount
        })
      }
      // if (enter) {
      //   this.pushMessage(createSystemMessage(`${enter.nickName}已加入学习频道，当前共 ${total} 人`));
      // } else {
      //   this.pushMessage(createSystemMessage(`${leave.nickName}已退出学习频道，当前共 ${total} 人`));
      // }
    });

    // 有人说话，创建一条消息
    tunnel.on('speak', speak => {
      console.log(this.tunnel)
      const { word, who } = speak;
      this.pushMessage(createUserMessage(word, who, who.openId === this.data.userInfo.openId));
    });

    tunnel.on('close', () => {
      //util.showSuccess('信道已断开')
      console.log('quickMatch 信道已断开')
      this.setData({ tunnelStatus: 'closed' })
    })

    tunnel.on('reconnecting', () => {
      console.log('quickMatch 信道正在重连...')
      //util.showBusy('正在重连')
    })

    tunnel.on('reconnect', () => {
      console.log('quickMatch 信道重连成功')
      //util.showSuccess('重连成功')
    })

    tunnel.on('error', error => {
      //util.showModel('信道发生错误', error)
      console.error('quickMatch 信道发生错误：', error)
    })

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
    console.log('this.data.messages', this.data.messages[0])

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
      this.pushMessage(createSystemMessage('您还没有加入学习频道，请稍后重试'));
      if (this.tunnel.isClosed()) {
        this.openTunnel();
      }
      return;
    }

    this.tunnel.emit('speak', { word: e.detail.value });
    this.setData({ inputContent: '' });


  },

  showInfo: function(e){
    this.setData({
      infoType: e.currentTarget.dataset.info_type
    })
  },

  toMatchRule: function(){
    this.quit()
    wx.navigateTo({
      url: '../../impromptu/matchRule/matchRule',
    })
  },

  onReady() {
    if (!this.pageReady) {
      this.pageReady = true;
      this.openTunnel();
    }
  },

  initUserInfo: function(){
    var that = this
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success(result) {
        console.log('result',result)
        that.setData({
          userInfo: result.data.data,
        })
      },

      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      }
    })
  },

  onShow() {
    
    this.initUserInfo()
    if (this.pageReady) {
      this.openTunnel();
    }
  },

  onLoad: function (options){
    console.log('options',options)
    rank = options.rank
    qcloud.login({
      success: function (result) {
      },
      fail: function () {
        util.showSuccess('登陆失效')
        wx.navigateBack({ delta: 99999 })
      }
    })
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