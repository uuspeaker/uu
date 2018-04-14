const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const dateUtil = require('../../common/dateUtil.js')
//const uuid = require('node-uuid')

module.exports = async ctx => {
  //查询用户ID
  var userId = await userInfo.getOpenId(ctx)

  //获取用户参会明细
  var scoreDetail = await mysql("user_score_detail").select('meeting_date', 'meeting_time', 'score_type').where({ user_id: userId }).orderBy('meeting_date', 'desc')
  
  ctx.state.data = scoreDetail

}