const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')

module.exports = {
  get: async ctx => {
    var limit = 100
    var offset = 0
    //查询用户ID
    var userId = await userInfo.getOpenId(ctx)
    leaderDetail = await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.user_id as user_id', mysql.raw("count(user_base_info.user_id) as total_score")).where({ 'user_base_info.recommend_user': userId }).groupBy('user_base_info.user_id').orderBy('total_score', 'desc').limit(limit).offset(offset),
      ctx.state.data = leaderDetail

    var allUserInfo = await mysql("user_base_info").select('user_id', 'nick_name')

    for (i = 0; i < leaderDetail.length; i++) {
      leaderDetail[i].rank = i + 1;
      for (j = 0; j < allUserInfo.length; j++) {
        if (leaderDetail[i].user_id == allUserInfo[j].user_id) {
          leaderDetail[i].nick_name = allUserInfo[j].nick_name
          continue;
        }
      }
    }
  }
  
}