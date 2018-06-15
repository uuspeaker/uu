var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')
var getlogininfo = require('../../../getlogininfo.js')
var userInfo = require('../../../common/userInfo.js')

//包含房间信息，房主信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberList: {},
    userInfo: {},
    clubInfo:{},
    officeList:[],
    normalMemberList:[]
  },

  //查询用户参会数据
  queryMyClubInfo: function () {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.myClub`,
      login: true,
      data: {},
      method: 'get',
      success(result) {
        wx.hideLoading()
        //util.showSuccess('请求成功完成')
        that.setData({
          clubInfo: result.data.data.clubInfo,
          memberList: result.data.data.memberList,
        })
        if (result.data.data.clubInfo.length > 0){
          that.formatDate()
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  cancelClub: function () {
    var content = '是否确定退出？'
    if (this.data.clubInfo[0].myRole == 0){
      content = '是否确定解散俱乐部？'
    }
    wx.showModal({
      title: '提示',
      content: content,
      success: (sm) => {
        if (sm.confirm) {
          this.doCancelClub()
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  doCancelClub: function () {
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.myClub`,
      login: true,
      data: { roleType: this.data.clubInfo[0].myRole, clubId: this.data.clubInfo[0].club_id},
      method: 'put',
      success(result) {
        wx.hideLoading()
        util.showSuccess('退出俱乐部') 
        wx.navigateBack({
          
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  formatDate: function () {
    var clubInfo = this.data.clubInfo
    clubInfo[0].createDateStr = dateFormat.format(new Date(clubInfo[0].create_date), 'yyyy年M月d日')

    var data = this.data.memberList
    var officeList = []
    var normalMemberList = []
    for (var i = 0; i < data.length; i++) {
      data[i].createDateStr = dateFormat.format(new Date(data[i].create_date),'yyyy年M月d日')
      data[i].userRank = userInfo.getRank(data[i].totalDuration)
      data[i].role = userInfo.getRole(data[i].role_type)
      if(data[i].role_type == 9){
        normalMemberList.push(data[i])
      }else{
        officeList.push(data[i])
      }
    }
    this.setData({
      clubInfo: clubInfo,
      memberList: data,
      officeList: officeList,
      normalMemberList: normalMemberList
    })
  },

  initUserInfo: function () {
    var that = this
    qcloud.request({
      url: config.service.requestUrl,
      login: true,
      success(result) {
        that.setData({
          userInfo: result.data.data,
        })
      },

      fail(error) {
        util.showModel('请求失败', error)
        console.log('request fail', error)
      }
    })

  },

  applyMeetingDefault: function (e) {
    this.applyMeeting('演讲者')
  },

  applyMeetingWithName: function (e) {
    var role = e.detail.value
    this.applyMeeting(role)
  },


  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id
    })
  },

  createClub: function () {
    wx.navigateTo({
      url: '../../club/createClub/createClub'
    })
  },

  toClubList: function () {
    wx.navigateTo({
      url: '../../club/clubList/clubList'
    })
  },

  toClubStudyRank: function () {
    wx.navigateTo({
      url: '../../club/clubRank/clubRank?scoreType=1&clubId=' + this.data.clubInfo[0].club_id,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryMyClubInfo()
  },

  onShow: function () {
  },

  onPullDownRefresh: function () {
    // this.queryMyClubInfo()
  },
})