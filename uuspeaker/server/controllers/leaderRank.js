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

  var allUserInfo = await mysql("user_base_info").select('user_id','nick_name')

  for (i = 0; i < ctx.state.data.leaderScore.length; i++) {
    ctx.state.data.leaderScore[i].rank = i + 1;
    for (j = 0; j < allUserInfo.length; j++) {
      if(ctx.state.data.leaderScore[i].user_id == allUserInfo[j].user_id){
        ctx.state.data.leaderScore[i].nick_name = allUserInfo[j].nick_name
        continue;
      }
    }
  }
  for (i = 0; i < ctx.state.data.leaderIncreaseScore.length; i++) {
    ctx.state.data.leaderIncreaseScore[i].rank = i + 1;
    for (j = 0; j < allUserInfo.length; j++) {
      if (ctx.state.data.leaderIncreaseScore[i].user_id == allUserInfo[j].user_id) {
        ctx.state.data.leaderIncreaseScore[i].nick_name = allUserInfo[j].nick_name
        continue;
      }
    }
  }
}