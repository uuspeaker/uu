const { mysql } = require('../qcloud')
const userInfo   = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  //查询用户ID
  var userId = await userInfo.getOpenId(ctx)
  //今天的日期
  var studyDate = dateUtil.getToday();
  //参会次数排名
  var rank = 0;
  //总人数
  var totalNum = 0;
  //参会排名超过多少人（百分比）
  var overRate = 0;
  //返回结果
  var userScoreDatas = []

  //获取用户参会次数
  var meetingScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: 1 })
  //获取用户参会排名
  var meetingScoreRankRes = await mysql("user_score_detail").select('user_id', mysql.raw("count(user_id) as total_score")).where({score_type: 1}).groupBy('user_id').orderBy('total_score', 'desc')
  
  totalNum = meetingScoreRankRes.length
  for (i = 0; i < totalNum; i++){
    if(meetingScoreRankRes[i].user_id == userId){
      rank = i + 1;
      break;
    }
  }

  overRate = new Number(100 * (totalNum - rank) / (totalNum - 1))
  overRate = overRate.toFixed(0)

  //获取用户学习时间
  var studyDurationRes = await mysql("user_study_duration").sum('study_duration as totalScore').where({ user_id: userId, study_date: studyDate})
  userScoreDatas.push({
    userId: userId,
    meetingScore: meetingScoreRes[0]['totalScore'],
    studyDuration: studyDurationRes[0]['totalScore'], 
    overRate: overRate   
  })
  ctx.state.data = userScoreDatas

}