var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var audioService = require('../../../common/audioService.js')
var dateFormat = require('../../../common/dateFormat.js')
var uuid = require('../../../common/uuid.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

const innerAudioContext = wx.createInnerAudioContext()

var showTimes = 0
var timeDuration = 0
var startDate
var endDate

var timetimeDuration = 0 //演讲时间

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCompleteTask: 0,
    isPlay: 0,
    userTask: {},
    oldTaskId: '0',

    tabs: ["今天", "我的", "全部"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,

    myTaskData:[],
    allTaskData:[]
  },

//用户按下录音按钮
  startRecord: function () {
    audioService.start()
    startDate = new Date()
  },

  //用户放开录音按钮
  stopRecord: function () {
    audioService.stop()
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
    if (timeDuration <= 1) {
      util.showModel('录音太短', '请录制一段超过10秒的语音');
      return
    }
    var taskId = uuid.v1()
    if (this.data.isCompleteTask == 1) {
      var that = this
      wx.showModal({
        title: '提示',
        content: '是否替换原有介绍？',
        success: function (sm) {
          if (sm.confirm) {
            setTimeout(audioService.saveAudio, 300, taskId)
            that.saveAudioRecord(taskId)
          } else if (sm.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      setTimeout(audioService.saveAudio, 300, taskId)
      this.saveAudioRecord(taskId)
      this.setData({
        isCompleteTask: 1
      })
    }

  },

  //完成任务
  saveAudioRecord: function (taskId) {
    console.log('saveAudioRecord')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userTask`,
      login: true,
      data: { taskId: taskId, timeDuration: timeDuration, oldTaskId: this.data.oldTaskId ,taskType: this.data.taskType},
      method: 'post',
      success(result) {
        util.showSuccess('录音保存成功')
        that.setData({
          isCompleteTask: 1
        })
        //innerAudioContext.src = audioService.getSrc()
         that.getMyTask()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //获取我的历史任务及所有用户当天的任务
  getMyTask: function () {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/task.userTask`,
      login: true,
      data: {taskType: this.data.taskType},
      method: 'get',
      success(result) {
        console.log('result', result)
        that.setData({
          myTaskData: result.data.data.myTaskData,
          allTaskData: result.data.data.allTaskData,
        })
        that.initTodayAudio()
        that.resetTimeAndPlayStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //为任务点赞，并更新页面点赞数据
  likeIt: function (e) {
    var that = this
    var audioId= e.currentTarget.dataset.audio_id
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      method: 'put',
      data: { audioId: audioId, viewType: 'like' },
      success(result) {
        that.setData({
          myTaskData: that.getNewViewAmount(that.data.myTaskData, audioId, 'like'),
          allTaskData: that.getNewViewAmount(that.data.allTaskData, audioId, 'like')
        })

      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //格式化日期，将所有播放按钮置为不播放
  resetTimeAndPlayStatus: function(src){
    var myTaskData = this.data.myTaskData
    for (var i = 0; i < myTaskData.length; i++) {
      myTaskData[i].startDateStr = dateFormat.getTimeNotice(myTaskData[i].create_date)
      myTaskData[i].timeDurationStr = dateFormat.getFormatDuration(myTaskData[i].time_duration)
      myTaskData[i].isPlay = 0  
      if (myTaskData[i].src == src){
        myTaskData[i].isPlay = 1  
      }
    }
    var allTaskData = this.data.allTaskData
    for (var i = 0; i < allTaskData.length; i++) {
      allTaskData[i].startDateStr = dateFormat.getTimeNotice(allTaskData[i].create_date)
      allTaskData[i].timeDurationStr = dateFormat.getFormatDuration(allTaskData[i].time_duration)
      allTaskData[i].isPlay = 0  
      if (allTaskData[i].src == src) {
        allTaskData[i].isPlay = 1
      }
    }
    this.setData({
      myTaskData: myTaskData,
      allTaskData: allTaskData
    })
  },

  //找出今天的录音，并将录音按钮设置成正确的状态
  initTodayAudio: function(){
    var myTaskData = this.data.myTaskData 
    if (myTaskData.length > 0) {
      var today = dateFormat.format(new Date(), 'yyyyMMdd')
      var lastAudioDate = dateFormat.format(new Date(myTaskData[0].create_date), 'yyyyMMdd')
      if (today == lastAudioDate){
        this.setData({
          userTask: myTaskData,
          isCompleteTask: 1,
          oldTaskId: myTaskData[0].task_id
        })
        innerAudioContext.src = myTaskData[0].src
        console.log('src', innerAudioContext.src)
      }
      
    }
  },

  doRecordAgain: function () {
    this.setData({
      isCompleteTask: 0
    })
  },

  toTaskIndex: function () {
    wx.navigateTo({
      url: '../../task/taskIndex/taskIndex',
    })
  },

  play: function () {
    innerAudioContext.play()
    console.log('play', innerAudioContext.autoplay)
    this.setData({
      isPlay: 1
    })
  },

  stop: function () {
    innerAudioContext.stop()
    this.setData({
      isPlay: 0
    })
  },

  toAudioDetail: function (e) {
    wx.navigateTo({
      url: '../../impromptu/audioDetail/audioDetail?audioId=' + e.currentTarget.dataset.audio_id,
    })
  },

  playAudio: function (e) {
    var src = e.currentTarget.dataset.src
    var audioId = e.currentTarget.dataset.audio_id
    innerAudioContext.autoplay = true
    innerAudioContext.src = src
    this.resetTimeAndPlayStatus(src)

    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.userAudio`,
      login: true,
      method: 'put',
      data: { audioId: audioId, viewType: 'view' },
      success(result) {
        that.setData({
          myTaskData: that.getNewViewAmount(that.data.myTaskData, audioId, 'view'),
          allTaskData: that.getNewViewAmount(that.data.allTaskData, audioId, 'view')
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getNewViewAmount: function (data,audioId, viewType) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].audio_id == audioId && viewType == 'view') {
        data[i].view_amount = data[i].view_amount + 1
      }
      if (data[i].audio_id == audioId && viewType == 'like') {
        data[i].like_amount = data[i].like_amount + 1
      }
    }
    return data
  },

  stopAudio: function (e) {
    var src = e.currentTarget.dataset.src
    innerAudioContext.stop()
    this.resetTimeAndPlayStatus()
  },

  onLoad: function (options) {
    this.setData({
      taskType: options.taskType,
      isCompleteTask: 0,
      isPlay: 0,
      userTask: {},
      oldTaskId: '0',
    })
    this.getMyTask()
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
    innerAudioContext.onStop((res) => {
      console.log('onStop')
      this.resetTimeAndPlayStatus()
      this.setData({
        isPlay: 0
      })
    })
    innerAudioContext.onEnded((res) => {
      console.log('onEnd')
      this.resetTimeAndPlayStatus()
      this.setData({
        isPlay: 0
      })
    })

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

  onShow: function(){
    
  },

})