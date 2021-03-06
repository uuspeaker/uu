const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const audioService = require('../../service/audioService')

module.exports = {
  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var todayTimeDuration = await audioService.queryAudioDuration(userId)
    ctx.state.data = todayTimeDuration
  },

}