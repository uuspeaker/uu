const { mysql } = require('../../qcloud')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  //查询用户ID
  var userId = ctx.query.userId
  //返回结果
  var userScoreDatas = []

  //获取用户参会明细
  var scoreDetail = await mysql("user_score_detail").select('user_id', 'meeting_date', 'meeting_time', 'score_type').where({ user_id: userId }).orderBy('meeting_date','desc')
  //获取用户积分总额
  var totalScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId })
  //获取用户参会次数
  var meetingScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 1 })
  //获取用户演讲获奖次数
  var speakerScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 2 })
  //获取用户点评获奖次数
  var evaluatorScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 3 })
  //获取用户主持次数
  var hostScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 4 })
  //获取用户复盘次数
  var reportScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 5 })
  userScoreDatas.push({
    userId: userId,
    scoreDetail: scoreDetail,
    totalScore: totalScoreRes[0]['totalScore'],
    meetingScore: meetingScoreRes[0]['totalScore'],
    speakerScore: speakerScoreRes[0]['totalScore'],
    evaluatorScore: evaluatorScoreRes[0]['totalScore'],
    hostScore: hostScoreRes[0]['totalScore'],
    reportScore: reportScoreRes[0]['totalScore']
  })
  ctx.state.data = userScoreDatas
  
}