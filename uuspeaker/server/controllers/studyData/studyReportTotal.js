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
    var studyReport = await studyDataService.getStudyReportTotal(userId)
    ctx.state.data = studyReport
  },

}