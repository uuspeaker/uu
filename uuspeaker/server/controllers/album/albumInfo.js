const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const albumService = require('../../service/albumService')
const userInfoService = require('../../service/userInfoService')

module.exports = {
  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var albumName = ctx.query.albumName
    if (albumName == undefined) {
      albumName = ''
    }
    var albumData = []
    if (queryUserType == 1) {
      albumData = await albumService.getMyAlbum(userId, queryPageType, firstDataTime, lastDataTime, albumName)
    }
    if (queryUserType == 2) {
      albumData = await albumService.getAllAlbum(queryUserType, queryPageType, firstDataTime, lastDataTime, albumName)
    }

    ctx.state.data = albumData
  },

  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var albumName = ctx.request.body.albumName
    await albumService.createAlbum(userId, albumName)
  },

  put: async ctx => {
    var albumId = ctx.request.body.albumId 
    var albumType = ctx.request.body.albumType 
    await albumService.changeAlbumType(albumId, albumType)
  },

  del: async ctx => {
    var albumId = ctx.request.body.albumId
    await albumService.deleteAlbum(albumId)
  },

}