const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const audioService = require('../../service/audioService')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    var roomId = ctx.request.body.roomId
    var audioName = ctx.request.body.audioName
    var timeDuration = ctx.request.body.timeDuration
    var audioType = ctx.request.body.audioType

    //如果是演讲,直接保存
    if (audioType == 1){
      audioService.saveSpeechAudio(roomId, audioId,1, audioName,userId, timeDuration)
    }else{//如果是点评,则保存并更新演讲的点评次数
      audioService.evaluateLatestAudio(roomId, audioId, audioName, userId, timeDuration)
    }
    ctx.state.data = await audioService.getSrc(audioId)
  },

  put: async ctx => {
    var audioId = ctx.request.body.audioId
    var timeDuration = ctx.request.body.timeDuration
    await audioService.completeSpeechAudio(audioId, timeDuration)
  },

  del: async ctx => {
    var audioId = ctx.request.body.audioId
    audioService.deleteAudio(audioId)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.query.roomId
    var audioData = await audioService.getSpeechAudioByRoom(roomId, userId)
    ctx.state.data = audioData
  },

}