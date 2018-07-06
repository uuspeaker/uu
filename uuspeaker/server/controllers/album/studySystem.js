const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const albumService = require('../../service/albumService')
const userInfoService = require('../../service/userInfoService')

module.exports = {
  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var clubId = ctx.query.clubId
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var albumName = ctx.query.albumName
    if (albumName == undefined) {
      albumName = ''
    }
    var albumData = []
    albumData = await albumService.getStudySystem(clubId, queryPageType, firstDataTime, lastDataTime, albumName)

    ctx.state.data = albumData
  },

}