const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const config = require('../../config')
const quickMatchService = require('../../service/quickMatchService')


module.exports = {
  post: async ctx => {
    var userInfo = await userInfoService.getUserInfoByKey(ctx)
    quickMatchService.startMatch(userInfo)
    ctx.state.data = userInfo.userId
  },

  put: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    quickMatchService.stopMatch(userId)
  },

  get: async ctx => {
    var userId = ctx.query.userId
    var roomId = quickMatchService.getMatchInfo(userId)
    ctx.state.data = roomId
  },

}