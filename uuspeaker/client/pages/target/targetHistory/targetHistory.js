var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var userInfo = require('../../../common/userInfo.js')
var dateFormat = require('../../../common/dateFormat.js')

//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetList: {},
  },


  //查询排名信息
  getTargetHistory: function () {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var queryData = { 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime }
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/target.targetHistory`,
      login: true,
      method: 'get',
      data: queryData,
      success(result) {
        wx.hideLoading()

        if (result.data.data == '') {
          util.showSuccess('没有更多记录')
          return
        }
        var resultData = []
        if (queryPageType == 0) {
          resultData = result.data.data
        } else if (queryPageType == 1) {
          resultData = [].concat(result.data.data, that.data.targetList)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.targetList, result.data.data)
        }
        //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
        
        that.setData({
          targetList: resultData
        })
        that.refreshDataId()
        that.formatDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshDataId: function () {
    var length = this.data.targetList.length
    firstDataTime = this.data.targetList[0].create_date
    lastDataTime = this.data.targetList[length - 1].create_date
  },

  formatDateAndStatus: function () {
    var data = this.data.targetList
    for (var i = 0; i < data.length; i++) {
      data[i].createDateStr = dateFormat.getSimpleFormatDate(data[i].create_date)
    }
    this.setData({
      targetList: data
    })
  },


  onLoad: function (options) {
    queryPageType = 0
    this.getTargetHistory()
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '我的学习目标' });
    wx.showShareMenu({
      withShareTicket: true
    })
  },


  onPullDownRefresh: function () {
    queryPageType = 1
    this.getTargetHistory()
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.getTargetHistory()
  },

})