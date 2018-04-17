const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userTaskService = require('../../service/userTaskService')
const audioService = require('../../service/audioService')
const uploadAudio = require('../../upload/uploadAudio')

module.exports = {
  //完成当天任务
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var taskId = ctx.request.body.taskId
    var taskName = ctx.request.body.taskName
    var timeDuration = ctx.request.body.timeDuration
    await userTaskService.saveSpecialTask(taskId, taskName, userId, timeDuration)

  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var taskData = []
    if(queryUserType == 1){
      taskData = await userTaskService.getMySpecialTask(userId, queryPageType, firstDataTime, lastDataTime)
    }
    if (queryUserType == 2 || queryUserType == 3) {
      taskData = await userTaskService.getAllSpecialTask(queryUserType, queryPageType, firstDataTime, lastDataTime)
    }
    if (queryUserType == 4) {
      taskData = await userTaskService.getTaskOfLikeUser(userId,queryUserType, queryPageType, firstDataTime, lastDataTime)
    }
    ctx.state.data = taskData
  },

}