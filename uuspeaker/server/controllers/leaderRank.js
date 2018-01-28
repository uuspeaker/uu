const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  var limit = 100
  var offset = 0
  var firstDayOfMonth = dateUtil.getFormatDate(new Date(), 'yyyyMM01')
  ctx.state.data = {
    
    leaderScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),

    leaderIncreaseScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).where('meeting_date', '>=', firstDayOfMonth).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),
  }


  for (i = 0; i < ctx.state.data.leaderScore.length; i++) {
    ctx.state.data.leaderScore[i].rank = i + 1;
  }
  for (i = 0; i < ctx.state.data.leaderIncreaseScore.length; i++) {
    ctx.state.data.leaderIncreaseScore[i].rank = i + 1;
  }
}