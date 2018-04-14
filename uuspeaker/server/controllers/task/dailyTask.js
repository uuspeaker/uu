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
    var oldTaskId = ctx.request.body.oldTaskId
    var taskType = ctx.request.body.taskType
    var timeDuration = ctx.request.body.timeDuration
    await userTaskService.saveDailyTask(taskId, taskType, userId, timeDuration)

  },

  //点评任务音频
  put: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var taskAudioId = ctx.request.body.taskAudioId
    var evaluationAudioId = ctx.request.body.evaluationAudioId
    var timeDuration = ctx.request.body.timeDuration
    await userTaskService.evaluateTask(taskAudioId, evaluationAudioId, userId, timeDuration)

  },

  //查询用户历史任务及所有用户当天的任务
  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var taskType = ctx.query.taskType

     var myTaskData = await userTaskService.getMyTask(userId, taskType)

    var allTaskData = await userTaskService.getUserTask(taskType)
    ctx.state.data = {
      myTaskData: myTaskData,
      allTaskData: allTaskData
    }

  },

}