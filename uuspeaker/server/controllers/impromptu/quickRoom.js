const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid');
const config = require('../../config')
const quickMatchService = require('../../service/quickMatchService')


module.exports = {
  post: async ctx => {
    var roomId = ctx.request.body.roomId
    var userId = ctx.request.body.userId
    var audioId = ctx.request.body.audioId
    var audioType = ctx.request.body.audioType
    var timeDuration = ctx.request.body.timeDuration
    quickMatchService.giveSpeech(roomId,userId,audioId,audioType,timeDuration)
  },

  put: async ctx => {
    var roomId = ctx.request.body.roomId
    var userId = ctx.request.body.userId
    quickMatchService.updateUserStatus(roomId,userId)
  },

  get: async ctx => {
    var roomId = ctx.query.roomId
    var roomInfo = quickMatchService.getRoomInfo(roomId)
    ctx.state.data = roomInfo
  },

}