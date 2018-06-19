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
    var audioName = ctx.request.body.audioName
    var audioText = ctx.request.body.audioText
    var timeDuration = ctx.request.body.timeDuration
    var audioType = ctx.request.body.audioType
    var speechType = ctx.request.body.speechType
    await userTaskService.saveSpecialTask(taskId, audioName, audioType,speechType,audioText,userId, timeDuration)

  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var audioType = ctx.query.audioType
    var audioName = ctx.query.audioName
    var taskData = []
    if(queryUserType == 1){
      taskData = await userTaskService.getMySpecialTask(userId, audioType, queryPageType, firstDataTime, lastDataTime, audioName)
    }
    if (queryUserType == 2 || queryUserType == 3) {
      taskData = await userTaskService.getAllSpecialTask(queryUserType, audioType, queryPageType, firstDataTime, lastDataTime, audioName)
    }
    if (queryUserType == 4) {
      //taskData = await userTaskService.getTaskOfLikeUser(userId, audioType, queryUserType, queryPageType, firstDataTime, lastDataTime)
      taskData = await userTaskService.getUnevaluatedTask(queryUserType, audioType, queryPageType, firstDataTime, lastDataTime, audioName)
    }
    for(var i=0; i<taskData.length; i++){
      if(taskData[i].user_id == userId){
        taskData[i].isMine = 1
      }else{
        taskData[i].isMine = 0
      }
    }
    ctx.state.data = taskData
  },

}