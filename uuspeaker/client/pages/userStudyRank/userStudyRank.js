var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    studyScore: {},
    influenceScore: {},
    totalScore: 0
  },

  queryUserScore: function (e) {
    util.showBusy('请求中...')
    var that = this
    var query = wx.createSelectorQuery()
    //var userId = this.inputContent['userId']
    qcloud.request({
      url: `${config.service.host}/weapp/userStudyRank`,
      login: false,
      //method: 'get',
      data: e.detail.value,
      success(result) {
        util.showSuccess('请求成功完成')
        that.setData({
          studyScore: result.data.data.studyScore,
          influenceScore: result.data.data.influenceScore,
          totalScore: result.data.data.studyScore.length
        })

        console.log(result.data.data)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  }

})

