const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const speechService = require('../../service/speechService')

module.exports = {

  get: async ctx => {
    var createDate = ctx.query.createDate
    var speechName = await speechService.getRandomSpeechName(createDate)
    ctx.state.data = speechName
  },

}