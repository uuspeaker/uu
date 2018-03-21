const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const config = require('../../config')

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
      await mysql('impromptu_audio').insert({
        audio_id: audioId,
        audio_name: audioName,
        user_id: userId,
        room_id: roomId,
        time_duration: timeDuration,
        audio_type: audioType
      })
    }else{//如果是点评,则保存并更新演讲的点评次数
      var audioData = await mysql('impromptu_audio').where({ room_id: roomId, audio_type: 1, audio_status: 2 }).orderBy('impromptu_audio.create_date', 'desc')

      if (audioData.length > 0) {
        //更新演讲的点评次数
        await mysql('impromptu_audio').update({
          comment_amount: audioData[0].comment_amount + 1
        }).where({ audio_id: audioData[0].audio_id })

        await mysql('impromptu_audio').insert({
          audio_id: audioId,
          audio_name: audioName,
          user_id: userId,
          room_id: roomId,
          time_duration: timeDuration,
          audio_type: audioType,
          relate_audio: audioData[0].audio_id
        })
      }
    }

    
    
  },

  put: async ctx => {
    var audioId = ctx.request.body.audioId
    var viewType = ctx.request.body.viewType
    if (viewType == 'view'){
      var audioView = await mysql('impromptu_audio').select('view_amount').where({ audio_id: audioId })
      await mysql('impromptu_audio').update({
        view_amount: audioView[0].view_amount + 1
      }).where({ audio_id: audioId })
    }
    if (viewType == 'like') {
      var audioView = await mysql('impromptu_audio').select('like_amount').where({ audio_id: audioId })
      await mysql('impromptu_audio').update({
        like_amount: audioView[0].like_amount + 1
      }).where({ audio_id: audioId })
    }
    
  },

  del: async ctx => {
    var audioId = ctx.request.body.audioId
    var userId = await userInfo.getOpenId(ctx)
    await mysql('impromptu_audio').where({ audio_id: audioId, user_id: userId }).del()
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.query.roomId

    var audioData = await mysql('impromptu_audio').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').select('impromptu_audio.*', 'cSessionInfo.user_info').orderBy('impromptu_audio.create_date', 'asc').where({ room_id: roomId, audio_type: 1, audio_status:2 })
    
    var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
    for (var i = 0; i < audioData.length; i++) {
      audioData[i].user_info = userInfo.getUserInfo(audioData[i].user_info)
      audioData[i].isMine = 0
      audioData[i].src = `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${audioData[i].audio_id}.mp3`
      if (userId == audioData[i].user_id) {
        audioData[i].isMine = 1
      }
    }
    ctx.state.data = audioData
  },

}