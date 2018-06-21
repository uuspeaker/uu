var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')

var clubId = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  applyClub: function(e){
    var requestData = e.detail.value
    requestData.clubId = clubId
    qcloud.request({
      url: `${config.service.host}/weapp/club.clubApply`,
      login: true,
      method: 'post',
      data: requestData,
      success(result) {
        var applyResult = result.data.data
        wx.hideLoading()
        if (applyResult == 1){
          util.showSuccess('申请成功')  
        }else{
          util.showSuccess('已经在俱乐部中')
        }
        // wx.navigateBack({
        // })
       
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    clubId = options.clubId
  },

  
})