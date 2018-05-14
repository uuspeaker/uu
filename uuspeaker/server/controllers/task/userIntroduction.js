const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const audioService = require('../../service/audioService')
const uploadAudio = require('../../upload/uploadAudio')

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    var oldAudioId = ctx.request.body.oldAudioId
    //var taskType = ctx.request.body.taskType
    var timeDuration = ctx.request.body.timeDuration
    if (oldAudioId != '0') {
      uploadAudio.deleteObject(oldAudioId)
      await audioService.deleteAudio(oldAudioId)
      await userInfoService.deleteIntroduction(userId)
    }
    
    await userInfoService.saveIntroduction(audioId, userId)
    await audioService.saveSpeechAudio('',audioId,'自我介绍',userId, timeDuration)
    
    
  },

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var audioData = await userInfoService.getIntroduction(userId)
    ctx.state.data = audioData
  },

}