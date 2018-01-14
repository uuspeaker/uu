const { mysql } = require('../qcloud')
//const uuid = require('node-uuid')

module.exports = async ctx => {

  ctx.state.data = {
    totalScore:await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).groupBy('user_id')
    .orderBy('total_score', 'desc'),

    meetingScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where({ score_type: 1 }).groupBy('user_id')
      .orderBy('total_score', 'desc'),

    speakerScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where({ score_type: 2 }).groupBy('user_id')
      .orderBy('total_score', 'desc'),

    evaluatorScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where({ score_type: 3 }).groupBy('user_id')
      .orderBy('total_score', 'desc'),

    hostScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where({ score_type: 4 }).groupBy('user_id')
      .orderBy('total_score', 'desc'),

    reportScore: await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where({ score_type: 5 }).groupBy('user_id')
      .orderBy('total_score', 'desc'),

    LeaderScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc')

  }
}