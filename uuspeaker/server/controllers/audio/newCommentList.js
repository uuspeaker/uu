const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const audioService = require('../../service/audioService');

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var audioDataComment = await audioService.queryNewCommentList(userId, queryPageType, firstDataTime, lastDataTime)

    ctx.state.data = audioDataComment
  },



}