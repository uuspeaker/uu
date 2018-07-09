var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat')
var getlogininfo = require('../../../getlogininfo.js')
var userInfo = require('../../../common/userInfo.js')

var noticeUserId = ''
var clubId = ''
//包含房间信息，房主信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    memberList: {},
    userInfo: {},
    clubInfo:[],
    officeList:[],
    normalMemberList:[],
    hideNotice:true,
    applyAmount:0,
    userNotice:'',
    isInClub:'9'
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
        if (result.data.data.clubInfo.length > 0){
          that.setData({
            clubInfo: result.data.data.clubInfo,
            memberList: result.data.data.memberList,
            isInClub:1
          })
          that.formatDate()
          clubId = result.data.data.clubInfo[0].club_id
          if (result.data.data.clubInfo[0].myRole == 1 || result.data.data.clubInfo[0].myRole == 2){
            that.queryClubApplyAmount()
          }
        }else{
          that.setData({
            isInClub: 0
          })
        }
        
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  //查询入会申请数据
  queryClubApplyAmount: function () {
    if (clubId == '')return
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubApply`,
      login: true,
      data: { clubId: clubId,queryType:1},
      method: 'get',
      success(result) {
        that.setData({
          applyAmount: result.data.data
        })    
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  cancelClub: function () {
    var content = '是否确定退出？'
    if (this.data.clubInfo[0].myRole == 1){
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
      method: 'delete',
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

  updateUser: function (e) {
    var userId = e.currentTarget.dataset.user_id
    var updateType = e.currentTarget.dataset.type
    //util.showBusy('请求中...')
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.myClub`,
      login: true,
      data: { userId: userId, updateType:updateType,clubId: this.data.clubInfo[0].club_id},
      method: 'put',
      success(result) {
        wx.hideLoading()
        util.showSuccess('操作成功') 
        that.queryMyClubInfo()
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  // updateUserBak: function (e) {
  //   var userId = e.currentTarget.dataset.user_id
  //   wx.showLoading({
  //     title: '加载中',
  //   })
  //   var that = this
  //   qcloud.request({
  //     url: `${config.service.host}/weapp/club.myClub`,
  //     login: true,
  //     data: { userId: userId, updateType:updateType,clubId: this.data.clubInfo[0].club_id},
  //     method: 'put',
  //     success(result) {
  //       wx.hideLoading()
  //       util.showSuccess('操作成功') 
  //       that.queryMyClubInfo()
  //     },
  //     fail(error) {
  //       util.showModel('请求失败', error);
  //       console.log('request fail', error);
  //     }
  //   })
  // },

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
      data[i].myRole = clubInfo[0].myRole
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

  //点击取消隐藏评论框
  hideUserNotce: function () {
    this.setData({
      hideNotice: true,
    })
  },

  setUserNotice : function(e) {
      this.setData({
        userNotice: e.detail.value,
      })
  },

  showUserNotice: function(e){
    this.setData({
      hideNotice: false,
    })
    noticeUserId = e.currentTarget.dataset.user_id
  },

  saveNotice : function() {
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/club.myClub`,
      login: true,
      data: { userId: noticeUserId, userNotice: this.data.userNotice, clubId: this.data.clubInfo[0].club_id },
      method: 'post',
      success(result) {
        wx.hideLoading()
        util.showSuccess('操作成功')
        that.queryMyClubInfo()
        that.setData({
          hideNotice: true,
          userNotice:''
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },


  toUserInfo: function (e) {
    wx.navigateTo({
      url: '../../userInfo/userInfoShow/userInfoShow?userId=' + e.currentTarget.dataset.user_id
    })
  },

  createClub: function () {
    wx.navigateTo({
      url: '../../club/createClub/createClub?operationType=1'
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

  toClubStudySystem: function () {
    wx.navigateTo({
      url: '../../club/studySystem/studySystem?scoreType=1&clubId=' + this.data.clubInfo[0].club_id,
    })
  },

  toApplyList: function () {
    wx.navigateTo({
      url: '../../club/clubApplyList/clubApplyList?clubId=' + this.data.clubInfo[0].club_id + '&myRole=' + this.data.clubInfo[0].myRole,
    })
  },

  toClubDetail: function () {
    wx.navigateTo({
      url: '../../club/clubDetail/clubDetail?clubId=' 
      + this.data.clubInfo[0].club_id 
      + '&clubName=' + this.data.clubInfo[0].club_name
      + '&clubDescription=' + this.data.clubInfo[0].club_description
      + '&src=' + this.data.clubInfo[0].src
      + '&timeDuration=' + this.data.clubInfo[0].time_duration,
    })
  },

  toModifyClub: function () {
    wx.navigateTo({
      url: '../../club/createClub/createClub?operationType=2&clubId=' 
      + this.data.clubInfo[0].club_id 
      + '&clubName=' + this.data.clubInfo[0].club_name
      + '&clubDescription=' + this.data.clubInfo[0].club_description,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.queryMyClubInfo()
  },

  onShow: function(){
    this.queryMyClubInfo()
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: '俱乐部',
    })
  },

  onPullDownRefresh: function () {
    // this.queryMyClubInfo()
  },
})