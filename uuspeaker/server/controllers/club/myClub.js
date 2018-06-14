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

}