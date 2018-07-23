const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid')
var targetService = require('../../service/targetService');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var targetName = ctx.request.body.targetName
    var studyDuration = ctx.request.body.studyDuration
    var starAmount = ctx.request.body.starAmount
    var audioId = ctx.request.body.audioId
    var timeDuration = ctx.request.body.timeDuration
    await targetService.saveTarget(userId, targetName, studyDuration, starAmount, audioId, timeDuration)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var data = await targetService.getMyTarget(userId)
    ctx.state.data = data
  },

  del: async ctx => {
    var targetId = ctx.request.body.targetId
    var data = await targetService.disposeTarget(targetId)
    ctx.state.data = data
  },

  put: async ctx => {
    var targetId = ctx.request.body.targetId
    var data = await targetService.completeTarget(targetId)
    ctx.state.data = data
  },

}