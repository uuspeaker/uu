const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const audioService = require('../../service/audioService')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var audioId = ctx.request.body.audioId
    audioService.viewAudio(userId,audioId)
  },

}