var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var userInfo = require('../../../common/userInfo.js')
//查询标记(1-查自己;2-查所有;3-查最赞)
var queryScoreType = ''
var clubId  = ''
var tmpRankList = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankList: {},
    viewStyle: [],
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

  //查询排名信息
  queryStudyRank: function (e) {
    var index = e.currentTarget.dataset.item
    this.pressView(index)
    var thisQueryScoreType = e.currentTarget.dataset.type
    if (queryScoreType == thisQueryScoreType) return
    queryScoreType = thisQueryScoreType
    this.setData({
      rankList: [],
    })
    this.doQueryStudyRank(queryScoreType)
  },

  //查询排名信息
  doQueryStudyRank: function (scoreType) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var queryData = { 'scoreType': scoreType, 'clubId': clubId}
    console.log('queryData', queryData)
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubRank`,
      login: true,
      method: 'get',
      data: queryData,
      success(result) {
        wx.hideLoading()
        console.log(result)
        if (result.data.data == '') {
          util.showSuccess('没有记录')
          return
        }
        that.setData({
          rankList: result.data.data
        })
        that.formatDateAndStatus()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDateAndStatus: function () {
    if (queryScoreType == 1) {
      tmpRankList = this.data.rankList
    }
    var data = this.data.rankList
    for (var i = 0; i < data.length; i++) {
      data[i].score = Math.floor((data[i].totalDuration + 59) / 60)
      data[i].index = i + 1
      if (queryScoreType == 1) {
        data[i].level = userInfo.getRank(data[i].totalDuration)
      } else {
        data[i].level = this.getTmpRank(data[i].user_info.userId)
      }

      data[i].dataType = queryScoreType
    }
    this.setData({
      rankList: data
    })
  },

  getTmpRank: function (userId) {
    for (var i = 0; i < tmpRankList.length; i++) {
      if (tmpRankList[i].user_info.userId == userId) {
        return tmpRankList[i].level
      }
    }
  },

  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id + '&nickName=' + e.currentTarget.dataset.nick_name + '&avatarUrl=' + e.currentTarget.dataset.avatar_url,
    })
  },

  onLoad: function (options) {
    clubId = options.clubId
    if (options.scoreType == 2) {
      queryScoreType = 2
      this.pressView(1)
    } else {
      queryScoreType = 1
      this.pressView(0)
    }
    this.doQueryStudyRank(options.scoreType)
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: '俱乐部排名' });
  },


})