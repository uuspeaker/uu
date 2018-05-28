const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var studyReport = await userInfoService.getStudyReportToday(userId)
    ctx.state.data = studyReport
  },

}