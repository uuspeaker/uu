const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  var limit = 100
  var offset = 0
  var firstDayOfMonth = dateUtil.getFormatDate(new Date(), 'yyyyMM01')
  ctx.state.data = {
    studyScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).groupBy('user_id').having('total_score', '>=', 5)
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

    studyIncreaseScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where('meeting_date', '>=', firstDayOfMonth).groupBy('user_id').having('total_score', '>=', 5)
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

  }
}