const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userTaskService = require('../../service/userTaskService')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    var taskType = ctx.request.body.taskType
    var timeDuration = ctx.request.body.timeDuration

    await userTaskService.saveTask(audioId, taskType , userId, timeDuration)

  },

  get: async ctx => {
    

  },

}