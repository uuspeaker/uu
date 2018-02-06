var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    modeItems: [
      { name: '普通模式', value: '1', checked: true},
      { name: '疯狂模式', value: '2' },
      { name: '娱乐模式', value: '3' },
      { name: '对抗模式', value: '4' }
    ],
    languageItems: [
      { name: '中文', value: '1', checked: true },
      { name: 'English', value: '2' }
    ],
    userInfo: {},
    startDate: dateFormat.format(new Date(), 'yyyy-MM-dd'),
    startTime: '21:00',
    endTime: '22:00'

  },

  languageChange: function (e) {
    var languageItems = this.data.languageItems;
    for (var i = 0, len = languageItems.length; i < len; ++i) {
      modeItems[i].checked = languageItems[i].value == e.detail.value;
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

  openImpromptuRoom: function (e) {
    console.log(e.detail.value)
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/impromptu.impromptuRoom`,
      data: e.detail.value,
      login: true,
      method: 'post',
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          applyResult: result.data.data
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  onLoad: function () {

  },

});