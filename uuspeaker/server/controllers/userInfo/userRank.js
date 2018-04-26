const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var scoreType = ctx.query.scoreType
    var rankList = []
    if (scoreType == 1){
      rankList = await userInfoService.getStudyRank(userId)
    }
    if (scoreType == 2) {
      rankList = await userInfoService.getInfluenceRank(userId)
    }
    ctx.state.data = rankList
  },

}