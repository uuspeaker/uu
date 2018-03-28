const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const audioService = require('../../service/audioService')
const config = require('../../config')

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    //var taskType = ctx.request.body.taskType
    var timeDuration = ctx.request.body.timeDuration

    await audioService.saveAudio(audioId, userId, timeDuration)
    await userInfoService.saveIntroduction(audioId, userId)

  },

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var audioData = await userInfoService.getIntroduction(userId)
    var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
    for (var i = 0; i < audioData.length; i++) {
      audioData[i].src = `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${audioData[i].introduce_audio_id}.mp3`
    }
    ctx.state.data = audioData
  },

}