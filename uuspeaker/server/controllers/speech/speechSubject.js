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
  put: async ctx => {
    var subjectId = ctx.request.body.subjectId
    var speechSubject = ctx.request.body.speechSubject
    var speechNames = ctx.request.body.speechNames
    await speechService.modifySpeechSubject(subjectId, speechSubject, speechNames)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var subjectData = await speechService.getMySpeechSubject(userId)
    ctx.state.data = subjectData
  },

}