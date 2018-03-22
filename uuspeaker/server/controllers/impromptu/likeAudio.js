const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const config = require('../../config')
const audioService = require('../../service/audioService')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.request.body.roomId

    var audio = await audioService.getSpeakingAudio(roomId)

    if (audio.length > 0){
      audioService.likeAudio(audio[0].audio_id, userId)
    }  
  },

  get: async ctx => {
    var audioId = ctx.query.audioId

    var audioData = audioService.getAudioLikeUser(audioId)
    ctx.state.data = audioData
  },


}