const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == '') {
      userId = await userInfo.getOpenId(ctx)
    }
    var studyReport = await userInfoService.getStudyReportToday(userId)
    if (studyReport.length == 0){
      studyReport = [
        {study_type:1,study_amount:0},
        { study_type: 2, study_amount: 0 },
        { study_type: 3, study_amount: 0 },
        { study_type: 4, study_amount: 0 }
        ]
    }
    ctx.state.data = studyReport
  },

}