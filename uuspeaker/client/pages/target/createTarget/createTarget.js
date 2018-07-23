var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
const uuid = require('../../../common/uuid');

var roomId = ''
var lastDays = [7, 30, 100, 365]
const recorderManager = wx.getRecorderManager()
var timeDuration = 0
var startDate
var endDate
var audioId
var tempFilePath
Page({
  data: {
    isPlay: 0,
    studyDuration: '',
    starAmount: '',
    targetName:'',
    userItems: [
      { 'name': '7天', 'value': '7' },
      { 'name': '30天', 'value': '30' },
      { 'name': '100天', 'value': '100' }
    ]

  },


  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);

    var userItems = this.data.userItems;
    for (var i = 0, len = userItems.length; i < len; ++i) {
      userItems[i].checked = userItems[i].value == e.detail.value;
      this.setData({
        studyDuration: userItems[i].value
      });
    }

    this.setData({
      userItems: userItems
    });
  },

  chooseStarAmount: function (e) {
    this.setData({
      starAmount: e.currentTarget.dataset.star
    })
  },

  startRecord: function () {
    this.setData({
      isPlay: 1
    })
    startDate = new Date()
    recorderManager.start(config.options)
  },


  //用户放开录音按钮
  stopRecord: function () {
    recorderManager.stop();
    this.setData({
      isPlay: 0
    })
    endDate = new Date()
    timeDuration = Math.floor((endDate - startDate) / 1000)
    console.log('timeDuration', timeDuration)
  },

  saveTarget: function () {
    if (this.data.starAmount == '') {
      util.showSuccess('请输入目标')
      return
    }
    if (this.data.starAmount == '') {
      util.showSuccess('请选择每天高效学习次数')
      return
    }
    if (this.data.studyDuration == '') {
      util.showSuccess('请选择计划坚持时间')
      return
    }
    if (timeDuration == 0) {
      util.showSuccess('请录制目标宣言')
      return
    }
    audioId = uuid.v1()
    var that = this
    console.log('tempFilePath', tempFilePath)
    const uploadTask = wx.uploadFile({
      url: `${config.service.host}/weapp/impromptu.impromptuAudio`,
      filePath: tempFilePath,
      name: 'file',
      formData: { audioId: audioId },
      success: function (result) {
        that.saveTargetData()
      },

      fail: function (e) {
        console.error(e)
      }
    })
  },

  saveTargetData: function () {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.userTarget`,
      data: { 'targetName': this.data.targetName, 'studyDuration': this.data.studyDuration, 'starAmount': this.data.starAmount, 'audioId': audioId, timeDuration: timeDuration },
      login: true,
      method: 'post',
      success(result) {
        util.showSuccess('目标制定成功')
        wx.redirectTo({
          url: '../../target/myTarget/myTarget'
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  setTargetName: function (e) {
    var targetName = e.detail.value
    targetName = targetName.replace(/^\s+|\s+$/g, "");
    this.setData({
      targetName: targetName
    })
  },

  onLoad: function () {
    this.initAudio()
  },

  initAudio: function () {
    recorderManager.onStop((res) => {
      tempFilePath = res.tempFilePath
    })
  },


});