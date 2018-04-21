const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
const userInfo = require('../common/userInfo.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  //查询用户ID
  var userId = await userInfo.getOpenId(ctx)
  var limit = 100
  var offset = 0
  var firstDayOfMonth = dateUtil.format(new Date(), 'yyyyMM01')
  ctx.state.data = {
    
    leaderScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),

    leaderIncreaseScore: await mysql("user_base_info").innerJoin('user_score_detail', 'user_base_info.user_id', 'user_score_detail.user_id').select('user_base_info.recommend_user as user_id', mysql.raw("count(user_base_info.recommend_user) as total_score")).where('meeting_date', '>=', firstDayOfMonth).groupBy('user_base_info.recommend_user').orderBy('total_score', 'desc').limit(limit).offset(offset),
  }

  //获取用户昵称，以便后面将用户ID变成昵称
  var allUserInfo = await mysql("user_base_info").select('user_id','nick_name')

  //处理影响力总榜信息
  for (i = 0; i < ctx.state.data.leaderScore.length; i++) {
    //给用户排名
    ctx.state.data.leaderScore[i].rank = i + 1;
    //获取当前登录用户的名次及分数
    if (userId == ctx.state.data.leaderScore[i].user_id) {
      ctx.state.data.myLeaderScoreRank = i + 1
      ctx.state.data.myLeaderScore = ctx.state.data.leaderScore[i].total_score
    }
    //将用户影响力信息中的user_id翻译成昵称
    for (j = 0; j < allUserInfo.length; j++) {
      if(ctx.state.data.leaderScore[i].user_id == allUserInfo[j].user_id){
        ctx.state.data.leaderScore[i].nick_name = allUserInfo[j].nick_name
        continue;
      }
    }
    //抹去用户id信息，避免客户信息泄露
    ctx.state.data.leaderScore[i].user_id = ''
  }

  //处理影响力进步榜信息
  for (i = 0; i < ctx.state.data.leaderIncreaseScore.length; i++) {
    //给用户排名
    ctx.state.data.leaderIncreaseScore[i].rank = i + 1;
    //获取当前登录用户的名次及分数
    if (userId == ctx.state.data.leaderIncreaseScore[i].user_id) {
      ctx.state.data.myLeaderIncreaseScoreRank = i + 1
      ctx.state.data.myLeaderIncreaseScore = ctx.state.data.leaderIncreaseScore[i].total_score
    }
    //将用户影响力信息中的user_id翻译成昵称
    for (j = 0; j < allUserInfo.length; j++) {
      if (ctx.state.data.leaderIncreaseScore[i].user_id == allUserInfo[j].user_id) {
        ctx.state.data.leaderIncreaseScore[i].nick_name = allUserInfo[j].nick_name
        continue;
      }
    }
    //抹去用户id信息，避免客户信息泄露
    ctx.state.data.leaderIncreaseScore[i].user_id = ''
  }
}