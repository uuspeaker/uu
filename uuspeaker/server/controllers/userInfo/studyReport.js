const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == '') {
      userId = await userInfo.getOpenId(ctx)
    }
    var studyReport = await userInfoService.getStudyReport(userId)
    ctx.state.data = studyReport
  },

}