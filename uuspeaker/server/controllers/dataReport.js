const { mysql } = require('../qcloud')

module.exports = async ctx => {
  var startDate = ctx.query.startDate
  var endDate = ctx.query.endDate
  ctx.state.data = {
    totalUserAmount: await mysql("user_score_detail").countDistinct(' user_id as totalScore').andWhere('meeting_date', '<=', endDate),
    studyUserAmount: await mysql("user_score_detail").countDistinct(' user_id as totalScore').andWhere('meeting_date', '>=', startDate).andWhere('meeting_date', '<=', endDate),
    studyAmount: await mysql("user_score_detail").count('user_id as totalScore').andWhere('score_type','=',1).andWhere('meeting_date', '>=', startDate).andWhere('meeting_date', '<=', endDate),
   // studyRate: studyUserAmount / totalUserAmount,
    reportCount: await mysql("user_score_detail").count('user_id as totalScore').andWhere('score_type', '=', 4).andWhere('meeting_date', '>=', startDate).andWhere('meeting_date', '<=', endDate),
    //reportRate: reportCount / studyAmount,
    increasedUser: await mysql("user_base_info").count('user_id as totalScore').where('first_speak_date', '>=', startDate),
   

  }
}