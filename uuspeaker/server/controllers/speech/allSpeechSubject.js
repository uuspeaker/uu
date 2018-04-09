const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const speechService = require('../../service/speechService.js')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryFlag = ctx.query.queryFlag
    var firstReportTime = ctx.query.firstReportTime
    var lastReportTime = ctx.query.lastReportTime
    var allSpeechSubject = await speechService.getAllSpeechSubject(userId, queryFlag, firstReportTime, lastReportTime)

    ctx.state.data = allSpeechSubject

    
  }
}