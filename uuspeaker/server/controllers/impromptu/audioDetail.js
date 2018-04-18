const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const audioService = require('../../service/audioService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.query.audioId

    //查询音频详情
    var audioData = await audioService.queryAudioById(audioId)
    for (var i = 0; i < audioData.length; i++) {
      if (userId == audioData[i].user_id) {
        audioData[i].isMine = 1
      }
    }
    var audioDataLike = await audioService.getAudioLikeUser(audioId)
    var likeIt = 0

    // //查询音频点赞用户
    // var likeIt = 0
    // var audioDataLike = await mysql('impromptu_audio_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio_like.user_id').select('impromptu_audio_like.*', 'cSessionInfo.user_info').where({ audio_id: audioId }).orderBy('impromptu_audio_like.create_date', 'asc')

    for (var i = 0; i < audioDataLike.length; i++) {
      if (userId == audioDataLike[i].user_id) {
        likeIt = 1
      }
    }

    ctx.state.data = {
      likeIt: likeIt,
      audioData:audioData,
      audioDataLike: audioDataLike,
      //audioDataComment: audioDataComment
      }
  },

}