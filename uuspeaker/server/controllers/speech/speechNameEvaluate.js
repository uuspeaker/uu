const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const speechService = require('../../service/speechService')

module.exports = {
  //完成当天任务
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var speechName = ctx.request.body.speechName
    var evaluateLevel = ctx.request.body.evaluateLevel
    await speechService.evaluateSpeechName(userId, speechName, evaluateLevel)
  },

  //完成当天任务
  del: async ctx => {
    var speechId = ctx.request.body.speechId
    await speechService.deleteSpeechName(speechId)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var speechNames = await speechService.getUnevaluatedSpeechNames(userId)
    ctx.state.data = speechNames
  },

}