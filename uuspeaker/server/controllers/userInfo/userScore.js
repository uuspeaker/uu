const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var totalStudyDuration = await userInfoService.getTotalStudyDuration(userId)
    var todayStudyDuration = await userInfoService.getTodayStudyDuration(userId)
    var totalInfluenceDuration = await userInfoService.getMyInfluenceTotal(userId)
    ctx.state.data = {
      totalStudyDuration: totalStudyDuration,
      todayStudyDuration: todayStudyDuration,
      totalInfluenceDuration: totalInfluenceDuration
    }
  },

}