const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')

module.exports = {
  get: async ctx => {
    var limit = 100
    var offset = 0
    //查询用户ID
    var userId = await userInfo.getOpenId(ctx)
    leaderDetail = await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.user_id as user_id', mysql.raw("count(user_base_info.user_id) as total_score")).where({'user_base_info.recommend_user':userId}).groupBy('user_base_info.user_id').orderBy('total_score', 'desc').limit(limit).offset(offset),

      ctx.state.data = leaderDetail
  }
}