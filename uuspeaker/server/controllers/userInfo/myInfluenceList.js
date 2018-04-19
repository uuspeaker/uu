const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == '') {
      userId = await userInfo.getOpenId(ctx)
    }
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime

    var userList = await userInfoService.getMyInfluenceList(userId)
    var userTotal = await userInfoService.getMyInfluenceTotal(userId)

    ctx.state.data = {
      userList: userList,
      userTotal: userTotal
    }
  },

}