const { mysql } = require('../qcloud')
//const uuid = require('node-uuid')

module.exports = async ctx => {

  ctx.state.data = {
    scoreDetail: await mysql("user_score_detail").select('user_id', 'meeting_date','meeting_time','score_type').where({user_id: 'Charles'})
  }
  console.log(ctx.state.data)
  //ctx.state.data = await mysql.select("user_id",mysql.raw("count(1) as total_score")).from("user_score_detail").groupByRaw('user_id')
  //ctx.state.speakerRank = await mysql("user_score_detail").count('1').groupby('user_id')
}