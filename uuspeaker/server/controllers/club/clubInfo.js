const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const clubService = require('../../service/clubService')

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var clubName = ctx.request.body.clubName
    var clubDescription = ctx.request.body.clubDescription
    ctx.state.data = await clubService.createClub(userId, clubName, clubDescription)
  },

  put: async ctx => {
    var clubId = ctx.request.body.clubId
    var clubName = ctx.request.body.clubName
    var clubDescription = ctx.request.body.clubDescription
    await clubService.updateClub(clubId, clubName, clubDescription)
    ctx.state.data = 2
  },

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var data = await clubService.getClubList(userId, queryPageType, firstDataTime, lastDataTime)
    ctx.state.data = data
  },

}