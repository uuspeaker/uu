const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  var countLimit = 0
  var limit = 100
  var offset = 0
  var firstDayOfMonth = dateUtil.format(new Date(),'yyyyMM01')
  ctx.state.data = {
    studyScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).groupBy('user_id').having('total_score', '>=', 5)
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

    studyIncreaseScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where('meeting_date', '>=', firstDayOfMonth).groupBy('user_id').having('total_score', '>=', 5)
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

    leaderScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),

    leaderIncreaseScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).where('meeting_date', '>=', firstDayOfMonth).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),
  }

  for (i = 0; i < ctx.state.data.studyScore.length; i++) {
    ctx.state.data.studyScore[i].rank = i + 1;
  }
  for (i = 0; i < ctx.state.data.studyIncreaseScore.length; i++) {
    ctx.state.data.studyIncreaseScore[i].rank = i + 1;
  }
  for (i = 0; i < ctx.state.data.leaderScore.length; i++) {
    ctx.state.data.leaderScore[i].rank = i + 1;
  }
  for (i = 0; i < ctx.state.data.leaderIncreaseScore.length; i++) {
    ctx.state.data.leaderIncreaseScore[i].rank = i + 1;
  }
}