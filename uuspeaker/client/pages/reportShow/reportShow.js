var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var dateFormat = require('../../common/dateFormat.js')
//var uuid = require('../../vendor/wafer2-client-sdk/lib/uuid');

//查询标记(0-查询最新;1-查询前面10条;2-查询后面10条)
var queryFlag = 0
var firstReportTime= ''
var lastReportTime = ''

Page({
  data: {
    studyReportData: []
  },

  //查询最新复盘列表,包含点赞及评论
  queryStudyReport: function (e) {
    //util.showBusy('请求中...')
    var that = this
    var queryData = { 'queryFlag': queryFlag, 'firstReportTime': firstReportTime, 'lastReportTime': lastReportTime }
    console.log(queryData)
    qcloud.request({
      url: `${config.service.host}/weapp/reportShow`,
      login: true,
      data: queryData,
      method: 'get',
      success(result) {
        //util.showSuccess('请求成功完成')
        var resultData = []
        if(queryFlag == 0){
          resultData = result.data.data
        }else if(queryFlag == 1){
          resultData = [].concat(result.data.data,that.data.studyReportData)
        }else if(queryFlag ==2){
          resultData = [].concat(that.data.studyReportData,result.data.data)
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
  refreshReportId: function(){
    var length = this.data.studyReportData.length
    firstReportTime = this.data.studyReportData[0].create_date
    lastReportTime = this.data.studyReportData[length - 1].create_date
  },

  formatDate: function(){
    var data = this.data.studyReportData
    var now = new Date()
    console.log(dateFormat.format(now,'yyyyMMdd'))
    for (var i = 0; i < data.length; i++) {
      var likeDate = new Date(data[i].create_date)
      var day = Math.floor((now - likeDate) / (24 * 60 * 60 * 1000))
      var hour = Math.floor((now - likeDate) / (60 * 60 * 1000))
      var min = Math.floor((now - likeDate) / (60 * 1000))
      if (min <= 1){
        data[i].createDateStr = '刚才'
      }else if (min < 60){
        data[i].createDateStr = min + '分钟前'
      } else if (hour >=1 && hour < 24){       
        data[i].createDateStr = hour + '小时前'
      } else if (day >= 1 && day < 7) {    
        data[i].createDateStr = day + '天前'
      }else{
        data[i].createDateStr = dateFormat.format(new Date(data[i].create_date), 'yyyyMMdd hh:mi')
      }   
      

      
      
    }
    this.setData({
      studyReportData: data
    })
  },

  arrayNamesToStr: function(){
    var data = this.data.studyReportData
     //遍历每一个复盘,将将复盘的所有点赞的人拼接成一条记录,逗号分割
    for (var i = 0; i < data.length; i++) {
      var userNames = ''
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
    //将拼接好的点赞人显示到界面
    this.setData({
      studyReportData: data
    })
  },

  //给复盘点赞
  likeArticle: function(e){
    var like = e.currentTarget.dataset.like
    //每点击一次,点赞或者取消点赞
    if (like == 1){
      like = 0
    }else{
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

  updateCurrentLikeUser: function (reportId, nickNameLikeList,like){
    var data = this.data.studyReportData
    for (var i = 0; i < data.length; i++) {
      if (data[i].report_id == reportId){
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

  onLoad: function (e) {
    queryFlag = 0
    this.queryStudyReport()
    //console.log(uuid.v1())
  },


  onPullDownRefresh: function () {
    queryFlag = 1
    this.queryStudyReport()
  },

  onReachBottom: function () {
    queryFlag = 2
    this.queryStudyReport()
  },

  

});