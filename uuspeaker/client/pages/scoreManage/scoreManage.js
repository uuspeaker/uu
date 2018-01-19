var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    dateArray: ['今天', '昨天', '前天', '3天前', '4天前', '5天前'],
    dateValue: [0,1,2,3,4,5],
    timeArray: ['20:00','21:00'],
    timeValue: [20,21],
    dateIndex: 0,
    timeIndex: 1

  },
  
  scoreManage: function (e) {
    this.initDateFormat();
    console.log(e.detail.value)
    util.showBusy('请求中...')
    var that = this
    var requestData = e.detail.value
    var now = new Date()
    var meetingDateMinus = this.data.dateValue[this.data.dateIndex]
    now.setDate(now.getDate() - meetingDateMinus)
    console.log(now.format('yyyyMMdd'))
    requestData.meetingDate = now.format('yyyyMMdd')
    requestData.meetingTime = this.data.timeValue[this.data.timeIndex]
    qcloud.request({
      url: `${config.service.host}/weapp/scoreManage`,
      data: requestData,
      login: false,
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
  bindDateChange: function (e) {
    this.setData({
      dateIndex: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      timeIndex: e.detail.value
    })
  },

  initDateFormat: function(){
    Date.prototype.format = function (fmt) { //author: meizz 
      var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    }
  }


})

