var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
//var uuid = require('../../vendor/wafer2-client-sdk/lib/uuid');

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    studyReportData: {}
  },

  queryStudyReport: function (e) {
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/reportShow`,
      login: true,
      method: 'get',
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          studyReportData: result.data.data
        })
        that.initNames()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  showReportComment: function(){
    that = this
    for (var i = 0; i < this.studyReportData.length; i++){
      qcloud.request({
        url: `${config.service.host}/weapp/reportLike`,
        login: true,
        method: 'get',
        success(result) {
          util.showSuccess('请求成功完成')
          that.setData({
            reportLikeData: result.data.data
          })
          
        },
        fail(error) {
          util.showModel('请求失败', error);
          console.log('request fail', error);
        }
      })
    }
  },

  initNames: function(){
    console.log(this.data.studyReportData.length)
    var data = this.data.studyReportData
    for (var i = 0; i < data.length; i++) {
      var userNames = ''
      //将所有点赞的人拼接成一条记录
      var nickNameLikeList = data[i].nickNameLikeList
      for (var j = 0; j < nickNameLikeList.length; j++) {
        if (j != nickNameLikeList.length - 1) {
          userNames = userNames + nickNameLikeList[j].nick_name + ','
        } else {
          userNames = userNames + nickNameLikeList[j].nick_name
        }
      }
      data[i].nickNameLikeStr = userNames  
    }
    this.setData({
      studyReportData: data
    })
  },

  likeArticle: function(e){
    var like = this.data.studyReportData.like
    if (like == 1){
      like = 0
    }else{
      like = 1
    }
    var reportId = e.currentTarget.dataset.reportid
    //this.refreshLike(reportId)
    console.log(reportId)
    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/likeReport`,
      login: true,
      data: {'like':like},
      method: 'post',
      data: {reportId: reportId},
      success(result) {
        util.showSuccess('请求成功完成')
        var nickNameLikeList = result.data.data
        that.updateReportLikeUser(reportId, nickNameLikeList, like)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  updateReportLikeUser: function (reportId, nickNameLikeList,like){
    var data = this.data.studyReportData
    for (var i = 0; i < data.length; i++) {
      if (data[i].report_id = reportId){
        data[i].nickNameLikeList = nickNameLikeList
        data[i].like = like
        this.setData({
          studyReportData: data
        })
      }
    }
    this.initNames()
  },

  onLoad: function (e) {
    this.queryStudyReport()
    //console.log(uuid.v1())
  },

});