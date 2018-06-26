const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const clubService = require('../../service/clubService')

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var clubId = ctx.request.body.clubId
    var audioId = ctx.request.body.audioId
    var applyNotice = ctx.request.body.applyNotice
    var timeDuration = ctx.request.body.timeDuration
    var isInClub = await clubService.isInClub(userId)
    if (isInClub){
      ctx.state.data = 9
    }else{
      await clubService.applyClub(userId, clubId, audioId, timeDuration)
      ctx.state.data = 1
    }
  },

  put: async ctx => {
    var userId = ctx.request.body.userId
    var clubId = ctx.request.body.clubId
    var operationType = ctx.request.body.operationType
    if (operationType == 1){
      await clubService.passApply(clubId,userId)
      ctx.state.data = 1
    }
    if (operationType == 2){
      await clubService.denyApply(clubId,userId)
      ctx.state.data = 2
    }
    
  },

  get: async ctx => {
    var clubId = ctx.query.clubId
    var queryType = ctx.query.queryType
    if (queryType == 1){
      ctx.state.data = await clubService.getApplyUserAmount(clubId)
    }
    if (queryType == 2){
      ctx.state.data = await clubService.getApplyUserList(clubId)
    }
  }


}