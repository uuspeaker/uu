const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  //查询用户ID
  var userId = await userInfo.getOpenId(ctx)

  //返回结果
  var userScoreDatas = []

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
    meetingScore: meetingScoreRes[0]['totalScore'],
    speakerScore: speakerScoreRes[0]['totalScore'],
    evaluatorScore: evaluatorScoreRes[0]['totalScore'],
    hostScore: hostScoreRes[0]['totalScore'],
    reportScore: reportScoreRes[0]['totalScore']
  })
  ctx.state.data = userScoreDatas

}