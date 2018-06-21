const { mysql } = require('../../qcloud')
const clubService = require('../../service/clubService')

module.exports = {

  get: async ctx => {
    var clubId = ctx.query.clubId
    var scoreType = ctx.query.scoreType
    var rankList = []
    if (scoreType == 1) {
      rankList = await clubService.getStudyRank(clubId)
    }
    if (scoreType == 2) {
      rankList = await clubService.getIncreaseRank(clubId)
    }
    ctx.state.data = rankList
  },

}