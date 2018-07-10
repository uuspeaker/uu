const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const speechService = require('../../service/speechService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var speechName = ''
    var amount = 0
    speechName = await speechService.getRandomSpeechName()
    while (amount < 3){
      var hasDone = await speechService.hasDoneSpeech(userId, speechName)
      console.log('hasDone',hasDone)
      if (!hasDone){
        ctx.state.data = speechName
        return
      }
      speechName = await speechService.getRandomSpeechName()
      amount++ 
    }
    ctx.state.data = speechName
  },

}