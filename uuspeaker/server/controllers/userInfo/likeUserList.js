const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const likeUserService = require('../../service/likeUserService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == ''){
      userId = await userInfoService.getOpenId(ctx)
    }
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var likeUserList = []
    if (queryUserType == 1){
      userList = await likeUserService.getLikeUserList(userId, queryPageType, firstDataTime, lastDataTime)
    }
    if (queryUserType == 2) {
      userList = await likeUserService.getMyFansList(userId, queryPageType, firstDataTime, lastDataTime)
    }
    ctx.state.data = userList
  },

}