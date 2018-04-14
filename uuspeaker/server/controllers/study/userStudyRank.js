const { mysql } = require('../../qcloud')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  var startDate = ctx.query.startDate
  var endDate = ctx.query.endDate
  ctx.state.data = {
    studyScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).andWhere('meeting_date', '>=', startDate).andWhere('meeting_date', '<=', endDate).groupBy('user_id')
      .orderBy('total_score', 'desc'),

    influenceScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).andWhere('user_base_info.first_speak_date', '>=', startDate).andWhere('user_score_detail.meeting_date', '>=', startDate).andWhere('user_score_detail.meeting_date', '<=', endDate).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc')

  }
}