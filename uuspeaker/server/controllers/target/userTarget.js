const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid')
var targetService = require('../../service/targetService');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var studyDuration = ctx.request.body.studyDuration
    var starAmount = ctx.request.body.starAmount
    await targetService.saveTarget(userId, studyDuration, starAmount)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var data = await targetService.getMyTarget(userId)
    ctx.state.data = data
  },

}