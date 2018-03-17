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
    var audioText = ctx.request.body.audioText

    await mysql('impromptu_audio').insert({
      audio_id: audioId,
      audio_name: audioName,
      user_id: userId,
      room_id: roomId,
      time_duration: timeDuration,
      audio_text: audioText
    })
  },

  put: async ctx => {
    var audioId = ctx.request.body.audioId
    var audioName = ctx.request.body.audioName
    var audioText = ctx.request.body.audioText
    await mysql('impromptu_audio').update({
      audio_name: audioName,
      audio_text: audioText
    }).where({ audio_id: audioId })
  },

  del: async ctx => {
    var audioId = ctx.request.body.audioId
    var userId = await userInfo.getOpenId(ctx)
    await mysql('impromptu_audio').where({ audio_id: audioId, user_id: userId }).del()
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryFlag = ctx.query.queryFlag
    var firstAudioTime = ctx.query.firstAudioTime
    var lastAudioTime = ctx.query.lastAudioTime
    var limit = 10
    var offset = 0
    var audioData

    if (queryFlag == 0) {
      audioData = await mysql('impromptu_audio').where({ user_id: userId }).limit(limit).offset(offset).orderBy('impromptu_audio.create_date', 'desc')
    }
    if (queryFlag == 1) {
      audioData = await mysql('impromptu_audio').where({ user_id: userId }).andWhere('impromptu_audio.create_date', '>', new Date(firstAudioTime)).orderBy('impromptu_audio.create_date', 'desc')
    }
    if (queryFlag == 2) {
      audioData = await mysql('impromptu_audio').where({ user_id: userId }).limit(limit).offset(offset).andWhere('impromptu_audio.create_date', '<', new Date(lastAudioTime)).orderBy('impromptu_audio.create_date', 'desc')
    }
    

    var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
    for (var i = 0; i < audioData.length; i++) {
      audioData[i].src = `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${audioData[i].audio_id}.mp3`
    }
    ctx.state.data = audioData
  },

}