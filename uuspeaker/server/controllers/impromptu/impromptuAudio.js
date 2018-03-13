const uploadAudio  = require('../../upload/uploadAudio.js')
const uuid = require('../../common/uuid.js')
const userInfo = require('../../common/userInfo')

module.exports = async ctx => {
  var audioId = uuid.v1() 
  const data = uploadAudio.upload(ctx.req, audioId)

  var userId = await userInfo.getOpenId(ctx)
  var roomId = ctx.request.body.roomId
  var audioName = ctx.request.body.audioName

  await mysql('impromptu_audio').insert(
    {
      audio_id: audioId,
      user_id: userId,
      room_id: roomId,
      audio_name: audioName
    })

  ctx.state.data = data
}
