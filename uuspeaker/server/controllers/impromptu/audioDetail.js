const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const config = require('../../config')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.query.audioId

    //查询音频详情
    var audioData = await mysql('impromptu_audio').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').select('impromptu_audio.*', 'cSessionInfo.user_info').orderBy('impromptu_audio.create_date', 'asc').where({ audio_id: audioId})

    var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
    for (var i = 0; i < audioData.length; i++) {
      audioData[i].user_info = userInfo.getUserInfo(audioData[i].user_info)
      audioData[i].isMine = 0
      audioData[i].src = `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${audioData[i].audio_id}.mp3`
      if (userId == audioData[i].user_id) {
        audioData[i].isMine = 1
      }
    }

    //查询音频点赞用户
    var likeIt = 0
    var audioDataLike = await mysql('impromptu_audio_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio_like.user_id').select('impromptu_audio_like.*', 'cSessionInfo.user_info').where({ audio_id: audioId }).orderBy('impromptu_audio_like.create_date', 'asc')

    for (var i = 0; i < audioDataLike.length; i++) {
      audioDataLike[i].user_info = userInfo.getUserInfo(audioDataLike[i].user_info)
      if (userId == audioDataLike[i].user_id) {
        likeIt = 1
      }
    }

    //查询音频评论用户
    var audioDataComment = await mysql('impromptu_audio').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').select('impromptu_audio.*', 'cSessionInfo.user_info').where({ relate_audio: audioId }).orderBy('impromptu_audio.create_date', 'asc')

    for (var i = 0; i < audioDataComment.length; i++) {
      audioDataComment[i].user_info = userInfo.getUserInfo(audioDataComment[i].user_info)
      audioDataComment[i].isMine = 0
      audioDataComment[i].src = `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${audioDataComment[i].audio_id}.mp3`
      if (userId == audioDataComment[i].user_id) {
        audioDataComment[i].isMine = 1
      }
    }

    ctx.state.data = {
      likeIt: likeIt,
      audioData:audioData,
      audioDataLike: audioDataLike,
      audioDataComment: audioDataComment
      }
  },

}