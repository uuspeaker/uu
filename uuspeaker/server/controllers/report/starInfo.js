const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const reportService = require('../../service/reportService')

module.exports = {

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var starInfo = await reportService.getStarList(userId)
    ctx.state.data = starInfo
  },

}