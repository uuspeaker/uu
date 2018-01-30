const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')

module.exports = {

  get: async ctx => {
    var limit = 100
    var offset = 0
    //获取用户复盘明细
    var studyReport = await mysql("user_study_report").innerJoin('user_base_info', 'user_base_info.user_id', 'user_study_report.user_id').select('user_base_info.nick_name','user_study_report.study_date', 'user_study_report.title', 'user_study_report.study_report','user_study_report.create_date').orderBy('create_date', 'desc').limit(limit).offset(offset)
    ctx.state.data = studyReport
  }
}