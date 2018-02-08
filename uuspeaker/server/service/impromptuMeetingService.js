const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')

/**
 * 获取房间所有参会人信息 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getMeetingUser = async (roomId) => {
  var today = dateUtil.getFormatDate(new Date(), 'yyyy-MM-dd')

  var MeetingUser = await mysql("meeting_apply").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'meeting_apply.user_id').innerJoin('user_score_detail', 'user_score_detail.user_id', 'meeting_apply.user_id').select('cSessionInfo.user_info', 'meeting_apply.role_type', 'meeting_apply.user_id','meeting_apply.create_date', mysql.raw("count(cSessionInfo.user_info) as totalScore")).where('room_id', roomId).groupBy('cSessionInfo.user_info', 'meeting_apply.role_type', 'meeting_apply.user_id', 'meeting_apply.create_date').orderBy('meeting_apply.create_date', 'asc')

  // var MeetingUser = await mysql.with('user_score', mysql("meeting_apply").innerJoin('user_score_detail', 'user_score_detail.user_id', 'meeting_apply.user_id').select('meeting_apply.user_id', mysql.raw("count(meeting_apply.user_id) as total_score")).where('room_id', roomId).groupBy('meeting_apply.user_id')).select('cSessionInfo.user_info','user_score.total_score').from('user_score').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_score.user_id')

  for (var i = 0; i < MeetingUser.length; i++) {
    //获取复盘人用户昵称及头像
    MeetingUser[i].userInfo = userInfo.getUserInfo(MeetingUser[i].user_info)
  }
  return MeetingUser
}

module.exports = { getMeetingUser }