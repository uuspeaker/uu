var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var roomId = ''
Page({
  data: {
    userInfo: {},
    startDate: dateFormat.format(new Date(), 'yyyy-MM-dd'),
    today: dateFormat.format(new Date(), 'yyyy-MM-dd'),
    startTime: '21:00',
    endTime: '22:00',
    notice: '',
    mode:'',
    title:'',
    language:'',
    operation: 'add',

    maxAmount: ["1", "2", "3", "4", "5", "6", "7", "8","9"],
    maxAmountIndex:8
  },

  bindMaxAmountyChange: function (e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);

    this.setData({
      maxAmountIndex: e.detail.value
    })
  },

  languageChange: function (e) {
    var languageItems = this.data.languageItems;
    for (var i = 0, len = languageItems.length; i < len; ++i) {
      languageItems[i].checked = languageItems[i].value == e.detail.value;
    }
    this.setData({
      languageItems: languageItems
    });
  },

  modeChange: function (e) {
    var modeItems = this.data.modeItems;
    for (var i = 0, len = modeItems.length; i < len; ++i) {
      modeItems[i].checked = modeItems[i].value == e.detail.value;
    }
    this.setData({
      modeItems: modeItems
    });
  },

  bindDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  bindStartTimeChange: function (e) {
    this.setData({
      startTime: e.detail.value
    })
  },

  bindEndTimeChange: function (e) {
    this.setData({
      endTime: e.detail.value
    })
  },

  cancelImpromptuRoom: function(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要取消会议吗？',
      success: function (sm) {
        if (sm.confirm) {
          that.doCancel()
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })   
  },

  doCancel: function(){
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuRoom`,
      data: { 'roomId': roomId },
      login: true,
      method: 'delete',
      success(result) {
        util.showSuccess('已成功取消会议')
        that.toImpromptuIndex()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  openImpromptuRoom: function (e) {
    var endDate = new Date(e.detail.value.startDate +' '+ e.detail.value.endTime + ':00')
    if(endDate <= new Date()){
      util.showNotice('结束时间必须大于当前时间')
      return
    }
    if (e.detail.value.startTime >= e.detail.value.endTime) {
      util.showNotice('结束时间必须大于开始时间')
      return
    }
    var requestData = e.detail.value
    requestData.maxAmount = this.data.maxAmount[requestData.maxAmount]
    console.log('requestData',requestData)
    var method = 'post'
    if (this.data.operation == 'modify'){
      method = 'put'
      requestData.roomId = roomId
    } 
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuRoom`,
      data: requestData,
      login: true,
      method: method,
      success(result) {
        util.showSuccess('会议申请成功')
        that.setData({
          applyResult: result.data.data
        })
        that.toImpromptuIndex()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  toImpromptuIndex: function () {
    wx.navigateTo({
      url: '../../impromptu/impromptuIndex/impromptuIndex',
    })
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
        if(that.data.title == ''){
          that.setData({
            title: '学习报名'
          })
        }
      },
      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      },
      complete: function (res) {

      },
    })
  },

  onLoad: function (options) {
    console.log(options)
    this.initUserInfo()
    if (options.operation == 'modify' || options.operation == 'view'){
      roomId = options.roomId
      //如果是修改，则默认值为之前保存的值
      // this.data.modeItems[0].checked = false
      // this.data.languageItems[0].checked = false
      // this.data.modeItems[parseInt(options.mode) - 1].checked = true
      // this.data.languageItems[parseInt(options.language) - 1].checked = true
      var startDateStr = dateFormat.format(new Date(options.startDate),'yyyy-MM-dd')
      var startTimeStr = dateFormat.format(new Date(options.startDate), 'hh:mm')
      var endTimeStr = dateFormat.format(new Date(options.endDate), 'hh:mm')
      this.setData({
        startDate: startDateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        title: options.title,
        notice: options.notice,
        maxAmountIndex: options.maxAmount-1,
        // modeItems: this.data.modeItems,
        // languageItems: this.data.languageItems,
        operation: options.operation
      })
    }else{
      
    }
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '创建房间' });
  },

});