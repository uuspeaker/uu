const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const likeUserService = require('../../service/likeUserService')

module.exports = {

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var likeUserId = ctx.query.likeUserId
    var likeUserTotal = await likeUserService.getLikeUserTotal(userId)
    var myFansTotal = await likeUserService.getMyFansTotal(userId)
    ctx.state.data = {
      likeUserTotal: likeUserTotal,
      myFansTotal: myFansTotal
    }
  },

}