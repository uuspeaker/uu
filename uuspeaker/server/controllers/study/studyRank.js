const { mysql } = require('../../qcloud')
const dateUtil = require('../../common/dateUtil.js')
const userInfo = require('../../common/userInfo.js')

module.exports = async ctx => {
  //查询用户ID
  var userId = await userInfo.getOpenId(ctx)
  var limit = 100
  var offset = 0
  var firstDayOfMonth = dateUtil.getFormatDate(new Date(), 'yyyyMM01')
  ctx.state.data = {
    studyScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.user_id', 'user_base_info.nick_name',mysql.raw("count(user_base_info.user_id) as total_score")).groupBy('user_base_info.user_id')
      .orderBy('total_score', 'desc').limit(limit).offset(offset),

    studyIncreaseScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.user_id','user_base_info.nick_name', mysql.raw("count(user_base_info.user_id) as total_score")).where('user_score_detail.meeting_date', '>=', firstDayOfMonth).groupBy('user_base_info.user_id')
      .orderBy('total_score', 'desc').limit(limit).offset(offset),
  }

  //处理学习力总榜信息
  for (i = 0; i < ctx.state.data.studyScore.length; i++) {
    //给用户排名
    ctx.state.data.studyScore[i].rank = i + 1;
    //获取当前登录用户的名次及分数
    if (userId == ctx.state.data.studyScore[i].user_id){
      ctx.state.data.myStudyScoreRank = i + 1
      ctx.state.data.myStudyScore = ctx.state.data.studyScore[i].total_score
    }
    //抹去用户id信息，避免客户信息泄露
    ctx.state.data.studyScore[i].user_id = ''
  }

  //处理学习力进步榜信息
  for (i = 0; i < ctx.state.data.studyIncreaseScore.length; i++) {
    //给用户排名
    ctx.state.data.studyIncreaseScore[i].rank = i + 1;
    //获取当前登录用户的名次及分数
    if (userId == ctx.state.data.studyIncreaseScore[i].user_id) {
      ctx.state.data.myStudyIncreaseScoreRank = i + 1
      ctx.state.data.myStudyIncreaseScore = ctx.state.data.studyIncreaseScore[i].total_score
    }
    //抹去用户id信息，避免客户信息泄露
    ctx.state.data.studyScore[i].user_id = ''
  }
}