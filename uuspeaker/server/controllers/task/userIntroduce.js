const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const audioService = require('../../service/audioService')

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    var taskType = ctx.request.body.taskType
    var timeDuration = ctx.request.body.timeDuration

    await audioService.saveAudio(audioId, taskType, userId, timeDuration)
    await userInfoService.saveIntroduction(audioId, userId)

  },

  get: async ctx => {


  },

}