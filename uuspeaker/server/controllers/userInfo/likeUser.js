const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const likeUserService = require('../../service/likeUserService')

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var likeUserId = ctx.request.body.likeUserId
    likeUserService.likeUser(userId, likeUserId)
  },

  del: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var likeUserId = ctx.request.body.likeUserId
    likeUserService.cancelLikeUser(userId, likeUserId)
  },

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var likeUserId = ctx.query.likeUserId
    var data = await likeUserService.isLikeUser(userId, likeUserId)
    ctx.state.data = data
  },

}