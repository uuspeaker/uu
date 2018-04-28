const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const config = require('../../config')
const randomMatchService = require('../../service/randomMatchService')


module.exports = {
  post: async ctx => {
    var userInfo = await userInfoService.getUserInfoByKey(ctx)
    var onlineUser = randomMatchService.enterRoom(userInfo)
    ctx.state.data = onlineUser
  },

  put: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    randomMatchService.leaveRoom(userId)
  },

  get: async ctx => {
    var userId = ctx.query.userId
    var userInfo = randomMatchService.getOnlineUser()
    ctx.state.data = userInfo
  },

}