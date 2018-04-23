const { mysql } = require('../../qcloud')
//const { dateFormat } = require('../../common/dateFormat')

module.exports = async ctx => {
  var meetingDate = ctx.query.meetingDate
  // var now = new Date()
  // var meetingDate = dateFormat.format(now, 'yyyyMMdd')
  var userIds = await mysql('meeting_apply').where({ 'meeting_date': meetingDate }).orderByRaw('meeting_type desc')
  var userScoreDatas = []
  
  for(var idx in userIds){
    var userId = userIds[idx]['user_id']
    var roleType = userIds[idx]['role_type']
    var totalScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId })
    var meetingScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 1 })
    var speakerScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 2 })
    var evaluatorScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 3 })
    var hostScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 4 })
    var reportScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 5 })
    userScoreDatas.push({
      userId: userId ,
      roleType: userIds[idx]['role_type'],
      meetingType: userIds[idx]['meeting_type'],
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