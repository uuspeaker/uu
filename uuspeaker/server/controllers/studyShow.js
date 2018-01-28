const { mysql } = require('../qcloud')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  //查询用户ID
  var userId = ctx.query.userId
  //返回结果
  var userScoreDatas = []

  //获取用户参会次数
  var meetingScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 1 })
  //获取用户学习时间
  var studyDurationRes = await mysql("user_study_duration").sum('study_duration as totalScore').where({ user_id: userId, study_date: '20180127' })
  userScoreDatas.push({
    userId: userId,
    meetingScore: meetingScoreRes[0]['totalScore'],
    studyDuration: studyDurationRes[0]['totalScore']    
  })
  ctx.state.data = userScoreDatas

}