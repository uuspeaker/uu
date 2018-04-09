const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const speechService = require('../../service/speechService')

module.exports = {
  //完成当天任务
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var speechSubject = ctx.request.body.speechSubject
    var speechNames = ctx.request.body.speechNames
    await speechService.saveSpeechSubject(userId, speechSubject, speechNames)
  },

  //完成当天任务
  del: async ctx => {
    var subjectId = ctx.request.body.subjectId
    await speechService.deleteSpeechSubject(subjectId)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryFlag = ctx.query.queryFlag
    var firstReportTime = ctx.query.firstReportTime
    var lastReportTime = ctx.query.lastReportTime
    var allSpeechSubject = await speechService.getMySpeechSubject(userId, queryFlag, firstReportTime, lastReportTime)

    ctx.state.data = allSpeechSubject
  },

}