const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const clubService = require('../../service/clubService')

module.exports = {

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var data = await clubService.getMyClubInfo(userId)
    ctx.state.data = data
  },

  put: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var roleType = ctx.request.body.roleType
    var clubId = ctx.request.body.clubId
    if (roleType == 0){
      await clubService.cancelClub(clubId,userId)
    } else if (roleType == 1){
      await clubService.dismissClub(clubId, userId)
    }
  },

}