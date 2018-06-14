const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var clubId = ctx.query.scoreType
    var scoreType = ctx.query.scoreType
    var rankList = []
    if (scoreType == 1) {
      rankList = await userInfoService.getStudyRankOfClub(clubId)
    }
    if (scoreType == 2) {
      rankList = await userInfoService.getIncreaseRankOfClub(clubId)
    }
    ctx.state.data = rankList
  },

}