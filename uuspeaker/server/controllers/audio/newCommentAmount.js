const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const audioService = require('../../service/audioService');

module.exports = {

  //查询某个演讲所有的点评
  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var commentAmount = await audioService.queryNewCommentAmount(userId)

    ctx.state.data = commentAmount
  },



}