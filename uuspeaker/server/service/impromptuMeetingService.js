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

  var MeetingUser = await mysql("meeting_apply").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'meeting_apply.user_id').leftJoin('user_score_detail', 'user_score_detail.user_id', 'meeting_apply.user_id').select('cSessionInfo.user_info', 'meeting_apply.role_type', 'meeting_apply.user_id', 'meeting_apply.create_date', mysql.raw("count(user_score_detail.user_id) as totalScore")).where('meeting_apply.room_id', roomId).groupBy('cSessionInfo.user_info', 'meeting_apply.role_type', 'meeting_apply.user_id', 'meeting_apply.create_date').orderBy('meeting_apply.create_date', 'asc')

  for (var i = 0; i < MeetingUser.length; i++) {
    //获取复盘人用户昵称及头像
    MeetingUser[i].user_info = userInfo.getUserInfoWithId(MeetingUser[i].user_info)
  }
  return MeetingUser
}

module.exports = { getMeetingUser }