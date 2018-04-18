const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var likeUserList = []
    if (queryUserType == 1){
      userList = await userInfoService.getLikeUserList(userId, queryPageType, firstDataTime, lastDataTime)
    }
    if (queryUserType == 2) {
      userList = await userInfoService.getMyFansList(userId, queryPageType, firstDataTime, lastDataTime)
    }
    ctx.state.data = userList
  },

}