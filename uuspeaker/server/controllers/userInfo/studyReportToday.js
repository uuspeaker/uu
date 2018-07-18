const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid');
const userInfoService = require('../../service/userInfoService')
const reportService = require('../../service/reportService')

module.exports = {

  get: async ctx => {
    var userId = ctx.query.userId
    if (userId == '') {
      userId = await userInfoService.getOpenId(ctx)
    }
    var studyReport = await reportService.getStudyReportToday(userId)
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