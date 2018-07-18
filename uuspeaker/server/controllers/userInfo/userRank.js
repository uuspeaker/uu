const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const userInfoService = require('../../service/userInfoService')
const likeUserService = require('../../service/likeUserService')

module.exports = {

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var scoreType = ctx.query.scoreType
    var rankList = []
    if (scoreType == 1){
      rankList = await likeUserService.getStudyRankOfLike(userId)
    } else if (scoreType >= 2 && scoreType <= 4){
      //rankList = await userInfoService.getInfluenceRank(userId)
      rankList = await likeUserService.getIncreaseRankOfLike(userId, scoreType)
    } else if (scoreType == 5){
      rankList = await likeUserService.getStudyStarOfLike(userId)
    }
    ctx.state.data = rankList
  },

}