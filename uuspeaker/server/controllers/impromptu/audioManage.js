const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    var roomId = ctx.request.body.roomId
    var audioName = ctx.request.body.audioName

    await mysql('impromptu_audio').insert({
      audio_id: audioId,
      audio_name: audioName,
      user_id: userId,
      room_id: roomId
    })

  },

  del: async ctx => {
    var audioId = ctx.request.body.audioId
    await mysql('impromptu_audio').where({ audio_id: audioId }).del()
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.request.body.roomId

    var audioData = await mysql('impromptu_audio').where({ room_id: roomId, user_id: userId })
    ctx.state.data = audioData
  },

}