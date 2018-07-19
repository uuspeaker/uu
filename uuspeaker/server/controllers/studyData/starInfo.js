const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const studyDataService = require('../../service/studyDataService')

module.exports = {

  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var starInfo = await studyDataService.getStarList(userId)
    ctx.state.data = starInfo
  },

}