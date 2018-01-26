const { mysql } = require('../qcloud')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  var countLimit = 0
  var limit = 50
  var offset = 0
  var firstDayOfMonth = '20180101'
  ctx.state.data = {
    studyScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).groupBy('user_id').having('total_score', '>=', 5)
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

    studyIncreaseScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where('meeting_date', '>=', firstDayOfMonth).groupBy('user_id').having('total_score', '>=', 5)
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

    leaderScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),

    leaderIncreaseScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).where('meeting_date', '>=', firstDayOfMonth).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),

  }
}