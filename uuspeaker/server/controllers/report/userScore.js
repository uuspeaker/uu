const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const reportService = require('../../service/reportService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == '') {
      userId = await userInfoService.getOpenId(ctx)
    }
    var todayStudyInfo = await reportService.getTodayStudyInfo(userId)
    var totalStudyInfo = await reportService.getTotalStudyInfo(userId)
    var totalStarAmount = await reportService.getStarAmount(userId)
    ctx.state.data = {
      todayStudyInfo: todayStudyInfo,
      totalStudyInfo: totalStudyInfo,
      totalStarAmount: totalStarAmount
    }
  },

}