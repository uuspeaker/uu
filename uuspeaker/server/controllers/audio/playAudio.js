const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const audioService = require('../../service/audioService');

module.exports = {

  //聆听音频
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var playDuration = ctx.request.body.playDuration
    await audioService.increasePlayDuration(userId, playDuration)
  },


}