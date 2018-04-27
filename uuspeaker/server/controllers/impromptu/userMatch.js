const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const config = require('../../config')
const randomMatchService = require('../../service/randomMatchService')


module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    randomMatchService.startMatch(userId)
    ctx.state.data = userId
  },

  put: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    randomMatchService.stopMatch(userId)
  },

  get: async ctx => {
    var userId = ctx.query.userId
    var userInfo = randomMatchService.getMatchInfo(userId)
    ctx.state.data = userInfo
  },

}