const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const config = require('../../config')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.request.body.roomId

    var audio = await mysql('impromptu_audio').where({ room_id: roomId, audio_status: 1 }).orderBy('create_date', 'desc')

    if (audio.length > 0){
      var audioId = audio[0].audio_id 
      var audioView = await mysql('impromptu_audio').select('like_amount').where({ audio_id: audioId })
      await mysql('impromptu_audio').update({
        like_amount: audioView[0].like_amount + 1
      }).where({ audio_id: audioId })

      var now = new Date()
      //var startDate = new Date(audio[0].start_date)
      var likeMoment = Math.floor((now - audio[0].create_date)/1000)
      await mysql('impromptu_audio_like').insert({
        audio_id: audioId,
        user_id: userId,
        like_moment: likeMoment
      })
    }  
  },

  // put: async ctx => {
  //   var audioId = ctx.request.body.audioId
  //   var viewType = ctx.request.body.viewType
  //   if (viewType == 'view') {
  //     var audioView = await mysql('impromptu_audio').select('view_amount').where({ audio_id: audioId })
  //     await mysql('impromptu_audio').update({
  //       view_amount: audioView[0].view_amount + 1
  //     }).where({ audio_id: audioId })
  //   }
  //   if (viewType == 'like') {
  //     var audioView = await mysql('impromptu_audio').select('like_amount').where({ audio_id: audioId })
  //     await mysql('impromptu_audio').update({
  //       like_amount: audioView[0].like_amount + 1
  //     }).where({ audio_id: audioId })
  //   }
  // },

  get: async ctx => {
    var audioId = ctx.query.audioId

    var audioData = await mysql('impromptu_audio_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio_like.user_id').select('impromptu_audio_like.*', 'cSessionInfo.user_info').where({ audio_id: audioId })

    for (var i = 0; i < audioData.length; i++) {
      audioData[i].user_info = userInfo.getUserInfo(audioData[i].user_info)
    }
    ctx.state.data = audioData
  },


}