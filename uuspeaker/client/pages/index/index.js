var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewStyle: [],
    textStyle: [],
    isChecked: true
  },

  initViewStyle: function () {
    var initViewStyle = new Array(10)
    for (var i = 0; i < initViewStyle.length; i++) {
      initViewStyle[i] = 'box-shadow: 2px 2px 8px 2px #888888;text-shadow: 1px 1px 1px silver;'
    }
    this.setData({
      viewStyle: initViewStyle
    })
  },

  pressView: function (e) {
    var index = e.currentTarget.dataset.item
    console.log(index)
    var tmpViewStyle = this.data.viewStyle
    tmpViewStyle[index] = 'box-shadow:0px 0px 0px 0px '
    this.setData({
      viewStyle: tmpViewStyle
    })
    var that = this
    setTimeout(this.initViewStyle, 200);
  },

  initTextStyle: function () {
    var tmpTextStyle = new Array(10)
    for (var i = 0; i < tmpTextStyle.length; i++) {
      tmpTextStyle[i] = 'text-shadow: 5px 5px 5px silver;'
    }
    this.setData({
      textStyle: tmpTextStyle
    })
  },

  pressText: function (e) {
    var index = e.currentTarget.dataset.item
    var tmtextStyle = this.data.textStyle
    console.log(index)
    tmtextStyle[index] = 'text-shadow:0px 0px 0px 0px'
    this.setData({
      textStyle: tmtextStyle
    })
    var that = this
    setTimeout(this.initTextStyle, 250);
  },

  toImpromptu: function () {
    wx.navigateTo({
      url: '../impromptu/impromptuIndex/impromptuIndex',
    })
  },

  likeArticle: function (articleId) {

  },

  commentArticle: function (articleId) {

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initViewStyle()
    this.initTextStyle()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})