const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const likeUserService = require('../../service/likeUserService')
const studyDataService = require('../../service/studyDataService')

module.exports = {

  //查询某个演讲所有的点评
  get: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var firstStudyDate = await studyDataService.getFirstStudyDate(userId)
    var firstSpeechDate = await studyDataService.getFirstSpeechDate(userId)
    var studyDays = await studyDataService.getStudyDays(userId)
    var studyAmount = await studyDataService.getStudyAmount(userId)
    var studyPartner = await likeUserService.getLikeUserList(userId,0,'','')
    

    ctx.state.data = {
      firstStudyDate: firstStudyDate,
      firstSpeechDate: firstSpeechDate,
      studyDays: studyDays,
      studyAmount: studyAmount,
      studyPartner: studyPartner,
    }
  },



}