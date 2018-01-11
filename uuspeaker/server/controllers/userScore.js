const { mysql } = require('../qcloud')

module.exports = async ctx => {
  var userId = ''
  ctx.state.data = {
    totalScore: await mysql("user_score_detail").select('count(user_id) as total_score').where({user_id:userId}),
    meetingScore: await mysql("user_score_detail").select('count(user_id) as meetingScore').where({ user_id: userId, score_type: 1 }),
    speakerScore: await mysql("user_score_detail").select('count(user_id) as meetingScore').where({ user_id: userId, score_type: 2 }),
    evaluatorScore: await mysql("user_score_detail").select('count(user_id) as meetingScore').where({ user_id: userId, score_type: 3 }),
    hostScore: await mysql("user_score_detail").select('count(user_id) as meetingScore').where({ user_id: userId, score_type: 4 }),
    reportScore: await mysql("user_score_detail").select('count(user_id) as meetingScore').where({ user_id: userId, score_type: 5 })

  }
}