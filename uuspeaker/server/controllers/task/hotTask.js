const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userTaskService = require('../../service/userTaskService')

module.exports = {
  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var taskData = await userTaskService.getHotTask()
    ctx.state.data = taskData
  },

}