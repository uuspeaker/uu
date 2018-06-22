// pages/club/clubDetail/clubDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clubName:'',
    clubDescription:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      clubName: options.clubName,
      clubDescription: options.clubDescription
    })
  },

  
})