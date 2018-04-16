const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const audioService = require('../../service/audioService')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    audioService.likeAudio(audioId, userId)
  },

  del: async ctx => {
    var audioId = ctx.request.body.audioId
    var userId = await userInfo.getOpenId(ctx)
    audioService.dontLikeAudio(audioId,userId)
  },

  get: async ctx => {
    var audioId = ctx.query.audioId
    var audioData = audioService.getAudioLikeUser(audioId)
    ctx.state.data = audioData
  },

}