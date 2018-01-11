const { mysql } = require('../qcloud')

module.exports = async ctx => {

  ctx.state.data = {
    meetingApplyList: await mysql('meeting_apply as a').join('user_score_detail as b', 'a.user_id','b.user_id').select('b.user_id', 'b.score_type',mysql.raw("count(b.user_id) as total_score")).groupBy('b.user_id','b.score_type')
    //.where({ meeting_date: '2018-1-11' })
  }


}