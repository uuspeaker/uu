var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

//1查询我的 2查询全部 
var queryUserType = ''
//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryPageType = 0
var firstDataTime = ''
var lastDataTime = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    speechNameList: [],
    userName: '',
    tapTime: ''
  },

  initViewStyle: function () {
    var initViewStyle = new Array(10)
    for (var i = 0; i < initViewStyle.length; i++) {
      initViewStyle[i] = ''
    }
    this.setData({
      viewStyle: initViewStyle
    })
  },

  pressView: function (index) {
    this.initViewStyle()
    var tmpViewStyle = this.data.viewStyle
    tmpViewStyle[index] = 'font-weight: bold;color: #576b95;font-size: 16px;'
    this.setData({
      viewStyle: tmpViewStyle
    })
    var that = this
  },

  queryRoomInfo: function (e) {
    var index = e.currentTarget.dataset.item
    this.pressView(index)
    var thisQueryUserType = e.currentTarget.dataset.type
    if (queryUserType == thisQueryUserType) return
    queryUserType = thisQueryUserType
    queryPageType = 0
    firstDataTime = ''
    lastDataTime = ''
    this.setData({
      speechNameList: []
    })
    this.queryImpromptuspeechNameList(queryUserType)
  },

  queryLastestspeechNameList: function () {
    if (queryUserType == 1) return
    queryUserType = 1
    queryPageType = 0
    this.setData({
      speechNameList: []
    })
    this.queryImpromptuspeechNameList(queryUserType)
  },

  queryMyspeechNameList: function () {
    if (queryUserType == 2) return
    queryUserType = 2
    queryPageType = 0
    this.setData({
      speechNameList: []
    })
    this.queryImpromptuspeechNameList(queryUserType)
  },


  //查询最新房间信息
  queryImpromptuspeechNameList: function (queryUserType) {
    wx.showLoading({
      title: '加载中',
    })
    var queryData = { 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime, queryUserType: queryUserType }
    console.log('queryData', queryData)
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/speech.speechNameInfo`,
      login: true,
      method: 'get',
      data: queryData,
      success(result) {
        wx.hideLoading()
        console.log(result)
        if (result.data.data == '') {
          util.showSuccess('没有更多记录')
          return
        }
        var resultData = []
        if (queryPageType == 0) {
          resultData = result.data.data
        } else if (queryPageType == 1) {
          resultData = [].concat(result.data.data, that.data.speechNameList)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.speechNameList, result.data.data)
        }
        that.setData({
          speechNameList: resultData
        })
        that.formatDate()
        //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
        that.refreshDataId()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  deleteSpeechName: function(e){
    var speechName = e.currentTarget.dataset.speech_name
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/speech.speechNameInfo`,
      login: true,
      method: 'delete',
      data: { speechName: speechName},
      success(result) {
        util.showSuccess('删除成功')
        var data = that.data.speechNameList
        for (var i=0; i<data.length; i++){
          if (data[i].speech_name == speechName){
            data.splice(i, 1)
          }
        }
        that.setData({
          speechNameList: data
        })  
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshDataId: function () {
    var length = this.data.speechNameList.length
    firstDataTime = this.data.speechNameList[0].start_date
    lastDataTime = this.data.speechNameList[length - 1].end_date
  },

  formatDate: function () {
    var data = this.data.speechNameList
    for (var i = 0; i < data.length; i++) {
      data[i].startDateStr = dateFormat.getTimeNotice(data[i].create_date)
    }
    console.log(data)
    this.setData({
      speechNameList: data
    })
  },


  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id
    })
  },

  onLoad: function (options) {
    queryPageType = 0
    queryUserType = 1
    this.queryImpromptuspeechNameList(queryUserType)
    this.pressView(0)
  },

  onPullDownRefresh: function () {
    queryPageType = 1
    this.queryImpromptuspeechNameList(queryUserType)
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.queryImpromptuspeechNameList(queryUserType)
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '演讲题目' });
  },

})