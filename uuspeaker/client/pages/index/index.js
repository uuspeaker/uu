//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    meetingApplyInfo: {}
  },

  // 用户登录示例
  login: function () {
    if (this.data.logged) return

    util.showBusy('正在登录')
    var that = this

    // 调用登录接口
    qcloud.login({
      success(result) {
        if (result) {
          util.showSuccess('登录成功')
          that.setData({
            userInfo: result,
            logged: true
          })
        } else {
          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          qcloud.request({
            url: config.service.requestUrl,
            login: true,
            success(result) {
              util.showSuccess('登录成功')

              that.setData({
                userInfo: result.data.data,
                logged: true
              })

            },

            fail(error) {
              util.showModel('请求失败', error)
              console.log('request fail', error)
            }
          })
        }
      },

      fail(error) {
        util.showModel('登录失败', error)
        console.log('登录失败', error)
      }
    })
    that.showMeetingApplyInfo();
  },

  showMeetingApplyInfo: function () {
    var userId = this.data.userInfo.openId;
    var nickName = this.data.userInfo.nickName;

    util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/meeting`,
      login: false,
      success(result) {
        util.showSuccess('请求会议数据成功完成')
        that.setData({
          meetingApplyInfo: JSON.stringify(result.data)
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  }

})
