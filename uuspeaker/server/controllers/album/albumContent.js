const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const albumService = require('../../service/albumService')
const userInfoService = require('../../service/userInfoService')

module.exports = {
  get: async ctx => {
    var albumId = ctx.query.albumId
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var data = await albumService.getAlbumContent(queryPageType, firstDataTime, lastDataTime,albumId)
    ctx.state.data = data
  },

  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var albumId = ctx.request.body.albumId
    var audioId = ctx.request.body.audioId
    await albumService.saveAlbumContent(albumId, audioId)
  },

  del: async ctx => {
    var albumId = ctx.request.body.albumId
    var audioId = ctx.request.body.audioId
    await albumService.deleteAlbumContent(albumId, audioId)
  },

}