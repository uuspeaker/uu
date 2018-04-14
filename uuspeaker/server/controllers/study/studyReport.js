const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const dateUtil = require('../../common/dateUtil.js')
const uuid = require('../../common/uuid.js');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var studyReport = ctx.request.body.studyReport
    var reportId = uuid.v1()

    //更新参会记录
    if (studyReport != '') {
      await mysql('user_study_report').insert(
        {
          report_id: reportId,
          user_id: userId,
          study_report: studyReport
        })
    }
  },

  get: async ctx => {
    //查询用户ID
    var userId = await userInfo.getOpenId(ctx)
    //获取用户参会明细
    var studyReport = await mysql("user_study_report").select('report_id','study_report').where({ user_id: userId }).orderBy('create_date', 'desc')
    ctx.state.data = studyReport
  }
}