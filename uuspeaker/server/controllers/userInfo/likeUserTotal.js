const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var likeUserId = ctx.query.likeUserId
    var likeUserTotal = await userInfoService.getLikeUserTotal(userId)
    var myFansTotal = await userInfoService.getMyFansTotal(userId)
    ctx.state.data = {
      likeUserTotal: likeUserTotal,
      myFansTotal: myFansTotal
    }
  },

}