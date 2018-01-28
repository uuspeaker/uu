const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  var limit = 100
  var offset = 0
  var firstDayOfMonth = dateUtil.getFormatDate(new Date(), 'yyyyMM01')
  ctx.state.data = {
    studyScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.nick_name', mysql.raw("count(user_base_info.user_id) as total_score")).groupBy('user_base_info.user_id')
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

    studyIncreaseScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.nick_name', mysql.raw("count(user_base_info.user_id) as total_score")).where('user_score_detail.meeting_date', '>=', firstDayOfMonth).groupBy('user_base_info.user_id')
      .orderBy('total_score', 'desc').limit(limit).offset(offset),
  }

  for (i = 0; i < ctx.state.data.studyScore.length; i++) {
    ctx.state.data.studyScore[i].rank = i + 1;
  }
  for (i = 0; i < ctx.state.data.studyIncreaseScore.length; i++) {
    ctx.state.data.studyIncreaseScore[i].rank = i + 1;
  }
}