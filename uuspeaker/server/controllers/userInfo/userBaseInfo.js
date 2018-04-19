const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    var userInfo = await userInfoService.getUserInfo(userId)
    var userIntroduction = await userInfoService.getIntroduction(userId)
    ctx.state.data = {
      userInfo: userInfo,
      userIntroduction: userIntroduction
    }
  },

}