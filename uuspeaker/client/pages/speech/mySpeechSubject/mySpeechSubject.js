var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')
//var uuid = require('../../vendor/wafer2-client-sdk/lib/uuid');

//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryFlag = 0
var firstReportTime = ''
var lastReportTime = ''
var commentReportId = ''

Page({
  data: {
    studyReportData: [],
    showComment: false,
    commentValue: ''
  },

  addSpeechSubject: function () {
    wx.navigateTo({
      url: '../addSpeechSubject/addSpeechSubject',
    })
  },

  toAllSpeechSubject: function () {
    wx.navigateTo({
      url: '../allSpeechSubject/allSpeechSubject',
    })
  },

  //查询最新复盘列表,包含点赞及评论
  queryAllSpeechSubject: function (e) {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var queryData = { 'queryFlag': queryFlag, 'firstReportTime': firstReportTime, 'lastReportTime': lastReportTime }
    console.log(queryData)
    qcloud.request({
      url: `${config.service.host}/weapp/speech.mySpeechSubject`,
      login: true,
      data: queryData,
      method: 'get',
      success(result) {
        wx.hideLoading()
        if (result.data.data == '') return;
        //util.showSuccess('请求成功完成')
        var resultData = []
        if (queryFlag == 0) {
          resultData = result.data.data
        } else if (queryFlag == 1) {
          resultData = [].concat(result.data.data, that.data.studyReportData)
        } else if (queryFlag == 2) {
          resultData = [].concat(that.data.studyReportData, result.data.data)
        }
        that.setData({
          studyReportData: resultData
        })
        //将点赞json数组转化成单行文字
        that.arrayNamesToStr()
        //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
        that.refreshReportId()
        //将时间格式化显示
        that.formatDate()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //保存第一条和最后一条数据的id,上拉和下拉的时候查询用
  refreshReportId: function () {
    var length = this.data.studyReportData.length
    firstReportTime = this.data.studyReportData[0].create_date
    lastReportTime = this.data.studyReportData[length - 1].create_date
  },

  formatDate: function () {
    var data = this.data.studyReportData
    for (var i = 0; i < data.length; i++) {
      var likeDate = new Date(data[i].create_date)
      data[i].createDateStr = dateFormat.getTimeNotice(likeDate)
      var commentData = data[i].commentList
      for (var j = 0; j < commentData.length; j++) {
        var commentDate = new Date(commentData[j].create_date)
        commentData[j].createDateStr = dateFormat.getTimeNotice(commentDate)
      }
    }
    this.setData({
      studyReportData: data
    })
  },

  arrayNamesToStr: function () {
    var data = this.data.studyReportData
    //遍历每一个复盘,将将复盘的所有点赞的人拼接成一条记录,逗号分割
    for (var i = 0; i < data.length; i++) {
      var userNames = ''
      var nickNameLikeList = data[i].nickNameLikeList
      for (var j = 0; j < nickNameLikeList.length; j++) {
        if (j != nickNameLikeList.length - 1) {
          userNames = userNames + nickNameLikeList[j].user_info.nickName + '，'
        } else {
          userNames = userNames + nickNameLikeList[j].user_info.nickName
        }
      }
      data[i].nickNameLikeStr = userNames
    }
    //将拼接好的点赞人显示到界面
    this.setData({
      studyReportData: data
    })
  },

  //给复盘点赞
  likeArticle: function (e) {
    var like = e.currentTarget.dataset.like
    //每点击一次,点赞或者取消点赞
    if (like == 1) {
      like = 0
    } else {
      like = 1
    }
    var reportId = e.currentTarget.dataset.reportid
    var requestDate = { 'reportId': reportId, 'like': like }
    console.log(requestDate)
    //util.showBusy('请求中...')
    var that = this
    //更新点赞信息,并返回最新的点赞列表并刷新页面显示
    qcloud.request({
      url: `${config.service.host}/weapp/likeReport`,
      login: true,
      data: requestDate,
      method: 'post',
      success(result) {
        //util.showSuccess('请求成功完成')
        var nickNameLikeList = result.data.data
        console.log("545555555555")
        console.log(nickNameLikeList)
        //用最新的点赞信息刷新页面显示(只刷新当前这条记录的数据)
        that.updateCurrentLikeUser(reportId, nickNameLikeList, like)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  updateCurrentLikeUser: function (reportId, nickNameLikeList, like) {
    var data = this.data.studyReportData
    for (var i = 0; i < data.length; i++) {
      if (data[i].subject_id == reportId) {
        data[i].nickNameLikeList = nickNameLikeList
        data[i].like = like
        this.setData({
          studyReportData: data
        })
        break
      }
    }
    this.arrayNamesToStr()
  },

  setCommentValue: function (e) {
    this.setData({
      commentValue: e.detail.value
    })

  },

  //点击评论显示评论框
  showCommentView: function (e) {
    commentReportId = e.target.dataset.reportid
    this.setData({
      showComment: true
    })
  },

  //点击提交更新评论并隐藏评论框
  saveComment: function () {
    var requestDate = { 'reportId': commentReportId, 'comment': this.data.commentValue }
    console.log(requestDate)
    //util.showBusy('请求中...')
    var that = this
    //更新点赞信息,并返回最新的点赞列表并刷新页面显示
    qcloud.request({
      url: `${config.service.host}/weapp/commentReport`,
      login: true,
      data: requestDate,
      method: 'post',
      success(result) {
        //util.showSuccess('请求成功完成')
        var commentList = result.data.data
        console.log("545555555555")
        console.log(commentList)
        //用最新的评论信息刷新页面显示(只刷新当前这条记录的数据)
        that.updateCurrentComment(commentReportId, commentList)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
    that.setData({
      showComment: false,
      commentValue: ''
    })
  },

  //提交评论后，更新界面的评论信息
  updateCurrentComment: function (reportId, commentList) {
    var data = this.data.studyReportData
    for (var i = 0; i < data.length; i++) {
      if (data[i].subject_id == reportId) {
        data[i].commentList = commentList
        this.setData({
          studyReportData: data
        })
        break
      }
    }
  },

  //点击取消隐藏评论框
  cancelComment: function (e) {
    this.setData({
      showComment: false
    })
  },

  deleteSpeechSubject: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          that.executeDeleteArticle(e)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  executeDeleteArticle: function (e) {

    var reportId = e.currentTarget.dataset.reportid
    var requestDate = { 'subjectId': reportId }
    //util.showBusy('请求中...')
    var that = this
    //更新发言信息,刷新页面显示
    qcloud.request({
      url: `${config.service.host}/weapp/speech.mySpeechSubject`,
      login: true,
      data: requestDate,
      method: 'delete',
      success(result) {
        //用最新的点赞信息刷新页面显示(只刷新当前这条记录的数据)
        that.updateReportList(reportId)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  updateReportList: function (reportId) {
    var data = this.data.studyReportData
    for (var i = 0; i < data.length; i++) {
      if (data[i].subject_id == reportId) {
        data.splice(i, 1)
      }
    }
    this.setData({
      studyReportData: data
    })
  },

  toImpromptuMeeting: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '../impromptu/impromptuMeeting/impromptuMeeting?' + '&roomId=' + e.currentTarget.dataset.room_id
    })
  },

  preventTouchMove: function () { },

  onShow: function (e) {
    queryFlag = 0
    this.queryAllSpeechSubject()
    //console.log(uuid.v1())
  },

  onPullDownRefresh: function () {
    queryFlag = 1
    this.queryAllSpeechSubject()
  },

  onReachBottom: function () {
    queryFlag = 2
    this.queryAllSpeechSubject()
  },



});