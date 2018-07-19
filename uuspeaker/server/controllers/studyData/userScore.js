const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const studyDataService = require('../../service/studyDataService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == '') {
      userId = await userInfoService.getOpenId(ctx)
    }
    var todayStudyInfo = await studyDataService.getTodayStudyInfo(userId)
    var totalStudyInfo = await studyDataService.getTotalStudyInfo(userId)
    var totalStarAmount = await studyDataService.getStarAmount(userId)
    ctx.state.data = {
      todayStudyInfo: todayStudyInfo,
      totalStudyInfo: totalStudyInfo,
      totalStarAmount: totalStarAmount
    }
  },

}