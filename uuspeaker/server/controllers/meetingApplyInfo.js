const { mysql } = require('../qcloud')

module.exports = async ctx => {

  var userIds = await mysql('meeting_apply').select('user_id')
  var userScoreDatas = []
  
  for(var idx in userIds){
    var userId = userIds[idx]['user_id']
    var totalScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId })
    var meetingScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 1 })
    var speakerScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 2 })
    var evaluatorScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 3 })
    var hostScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 4 })
    var reportScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 5 })
    userScoreDatas.push({
      userId: userId ,
      userName: 12,
      totalScore: totalScoreRes[0]['totalScore'] ,
      meetingScore: meetingScoreRes[0]['totalScore'],
      speakerScore: speakerScoreRes[0]['totalScore'] ,
      evaluatorScore: evaluatorScoreRes[0]['totalScore'] ,
      hostScore: hostScoreRes[0]['totalScore'] ,
      reportScore: reportScoreRes[0]['totalScore'] 
    })
  }
  ctx.state.data = userScoreDatas
}