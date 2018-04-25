const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const speechService = require('../../service/speechService')

module.exports = {
  //完成当天任务
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var speechName = ctx.request.body.speechName
    var data = await speechService.querySpeechByName(speechName)
    if(data.length == 1){
      ctx.state.data = 0
    }else{
      await speechService.saveSpeechName(userId, speechName)
      ctx.state.data = 1
    }
    
  },

  //完成当天任务
  del: async ctx => {
    var speechName = ctx.request.body.speechName
    await speechService.deleteSpeechName(speechName)
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDatatTime = ctx.query.firstDatatTime
    var lastDataTime = ctx.query.lastDataTime
    var speechNames = []
    if (queryUserType == 1){
      speechNames = await speechService.getMySpeechNameList(userId, queryPageType, firstDatatTime, lastDataTime)
    }
    if (queryUserType == 2) {
      speechNames = await speechService.getAllSpeechNameList(userId, queryPageType, firstDatatTime, lastDataTime)
    }
    ctx.state.data = speechNames
  },

}