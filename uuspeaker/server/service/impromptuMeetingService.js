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
  var today = dateUtil.format(new Date(), 'yyyy-MM-dd')

  var MeetingUser = await mysql("meeting_apply").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'meeting_apply.user_id').leftJoin('user_study_duration', 'user_study_duration.user_id', 'meeting_apply.user_id').select('cSessionInfo.user_info', 'meeting_apply.role_type', 'meeting_apply.user_id', 'meeting_apply.create_date', mysql.raw("sum(user_study_duration.study_duration) as totalScore")).where('meeting_apply.room_id', roomId).groupBy('cSessionInfo.user_info', 'meeting_apply.role_type', 'meeting_apply.user_id', 'meeting_apply.create_date').orderBy('meeting_apply.create_date', 'asc')

  for (var i = 0; i < MeetingUser.length; i++) {
    //获取复盘人用户昵称及头像
    MeetingUser[i].user_info = userInfo.getUserInfoWithId(MeetingUser[i].user_info)
  }
  return MeetingUser
}

/**
 * 获取房间所有参会人信息 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var joinMeeting = async (roomId, userId, roleType) => {
  await mysql('meeting_apply').insert(
    {
      room_id: roomId,
      user_id: userId,
      role_type: roleType
    })

  var amount = await mysql('meeting_apply').count('user_id as amount').where({ room_id: roomId })

  await mysql('impromptu_room').update({
    people_amount: amount[0].amount
  }).where({ room_id: roomId })
}



module.exports = { getMeetingUser, joinMeeting }