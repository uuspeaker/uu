const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const quickMatchService = require('../../service/quickMatchService')

module.exports = {

  get: async ctx => {
    var createDate = ctx.query.createDate
    var speechName = await quickMatchService.getRandomSpeechName()
    ctx.state.data = speechName
  },

}