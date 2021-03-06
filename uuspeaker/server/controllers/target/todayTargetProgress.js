const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid')
var targetService = require('../../service/targetService');

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == undefined || userId == '') {
      userId = await userInfo.getOpenId(ctx)
    }
    var data = await targetService.getTodayTargetProgress(userId)
    ctx.state.data = data
  },

}