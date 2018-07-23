const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid')
var targetService = require('../../service/targetService');

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var data = await targetService.getTargetHistory(userId, queryPageType, firstDataTime, lastDataTime)
    ctx.state.data = data
  },

}