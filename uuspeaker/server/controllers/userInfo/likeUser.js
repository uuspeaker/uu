const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var likeUserId = ctx.request.body.likeUserId
    userInfoService.likeUser(userId, likeUserId)
  },

  del: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var likeUserId = ctx.request.body.likeUserId
    userInfoService.cancelLikeUser(userId, likeUserId)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var likeUserId = ctx.query.likeUserId
    var data = await userInfoService.isLikeUser(userId, likeUserId)
    ctx.state.data = data
  },

}