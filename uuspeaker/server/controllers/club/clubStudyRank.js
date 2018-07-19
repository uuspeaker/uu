const { mysql } = require('../../qcloud')
const clubService = require('../../service/clubService')

module.exports = {

  get: async ctx => {
    var clubId = ctx.query.clubId
    var scoreType = ctx.query.scoreType
    var rankList = []
    if (scoreType == 1) {
      rankList = await clubService.getStudyRank(clubId)
    } else if (scoreType >= 2 && scoreType <= 4){
      rankList = await clubService.getIncreaseRank(clubId, scoreType)
    } else if (scoreType == 5){
      rankList = await clubService.getStudyStarRank(clubId)
    } 
    ctx.state.data = rankList
  },

}