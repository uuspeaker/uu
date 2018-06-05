const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const audioService = require('../../service/audioService');

module.exports = {

  //查询某个演讲所有的点评
  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.query.audioId
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var audioDataComment = await audioService.queryAudioComment(audioId, queryPageType, firstDataTime, lastDataTime)

    ctx.state.data = audioDataComment
  },

  //点评任务音频
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var targetAudioId = ctx.request.body.targetAudioId
    var evaluationAudioId = ctx.request.body.evaluationAudioId
    var timeDuration = ctx.request.body.timeDuration
    var audioText = ctx.request.body.audioText
    var roomId = ctx.request.body.roomId
    if (roomId == undefined) roomId = ''
    await audioService.evaluateAudio(roomId, evaluationAudioId, userId, timeDuration, targetAudioId, audioText)
    var src = await audioService.getSrc(evaluationAudioId)
    ctx.state.data = src
  },


}