const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid')
var targetService = require('../../service/targetService');

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var data = await targetService.getCurrentTargetProgress(userId)
    ctx.state.data = data
  },

}