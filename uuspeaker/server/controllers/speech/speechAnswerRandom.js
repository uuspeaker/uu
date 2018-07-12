const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const speechService = require('../../service/speechService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var amount = 0
    var speechAnswer = await speechService.getRandomSpeechAnswer()
    console.log('speechAnswer', speechAnswer)
    ctx.state.data = speechAnswer
  },

}