var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

//查询标记(1-查自己;2-查所有;3-查最赞)
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
    likeUsers: {},
    userId: '',
    nickName: ''
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

  queryLikeUserInfo: function (e) {
    var index = e.currentTarget.dataset.item
    this.pressView(index)
    var thisQueryUserType = e.currentTarget.dataset.type
    if (queryUserType == thisQueryUserType) return
    queryUserType = thisQueryUserType
    queryPageType = 0
    this.setData({
      likeUsers: []
    })
    this.doQueryLikeUser(queryUserType)
  },

  //查询自由练习任务信息
  doQueryLikeUser: function (queryUserType) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var queryData = {userId:this.data.userId, 'queryPageType': queryPageType, 'firstDataTime': firstDataTime, 'lastDataTime': lastDataTime, queryUserType: queryUserType }
    console.log('queryData', queryData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/userInfo.likeUserList`,
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
          resultData = [].concat(result.data.data, that.data.likeUsers)
        } else if (queryPageType == 2) {
          resultData = [].concat(that.data.likeUsers, result.data.data)
        }
        that.setData({
          likeUsers: resultData
        })
        that.formatDateAndStatus()
        //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
        that.refreshDataId()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshDataId: function () {
    var length = this.data.likeUsers.length
    firstDataTime = this.data.likeUsers[0].create_date
    lastDataTime = this.data.likeUsers[length - 1].create_date
  },

  formatDateAndStatus: function () {
    var data = this.data.likeUsers
    for (var i = 0; i < data.length; i++) {
      var now = new Date()
      data[i].createDateStr = dateFormat.getSimpleFormatDate(data[i].create_date)
    }
    this.setData({
      likeUsers: data
    })
  },

  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id + '&nickName=' + e.currentTarget.dataset.nick_name + '&avatarUrl=' + e.currentTarget.dataset.avatar_url,
    })
  },

  toFirstPage: function(){
    wx.navigateBack({ delta:99999})
  },

  onLoad: function (options) {
    queryUserType = options.queryUserType
    if(options.userId == undefined){

    }else{
      this.setData({
        userId : options.userId,
        nickName: options.nickName
      })
    }
  },

  onShow: function () {
    queryPageType = 0
    if (queryUserType == 2){
      queryUserType = 2
      this.pressView(1)
    } else{
      queryUserType = 1
      this.pressView(0)
    } 
    this.doQueryLikeUser(queryUserType)
  },

  onPullDownRefresh: function () {
    queryPageType = 1
    this.doQueryLikeUser(queryUserType)
  },

  onReachBottom: function () {
    console.log('onReachBottom')
    queryPageType = 2
    this.doQueryLikeUser(queryUserType)
  },

  

})