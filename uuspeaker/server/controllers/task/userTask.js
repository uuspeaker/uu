const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userTaskService = require('../../service/userTaskService')
const audioService = require('../../service/audioService')
const uploadAudio = require('../../upload/uploadAudio')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var taskId = ctx.request.body.taskId
    var oldTaskId = ctx.request.body.oldTaskId
    var taskType = ctx.request.body.taskType
    var timeDuration = ctx.request.body.timeDuration
    if (oldTaskId != '0') {
      uploadAudio.deleteObject(oldTaskId)
      await audioService.deleteAudio(oldTaskId)
      await userTaskService.deleteTask(oldTaskId)
    }
    await userTaskService.saveTask(taskId, taskType, userId, timeDuration)

  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var taskType = ctx.query.taskType
    var taskDate = await userTaskService.getTodayTask(userId, taskType)
    ctx.state.data = taskDate

  },

}