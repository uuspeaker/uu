const { mysql } = require('../qcloud')

module.exports = async ctx => {
  console.log(ctx.query.data)
  var userId = ctx.query.userId
  var meetingTime = ctx.query.meetingTime
  var roleType = ctx.query.roleType
  await mysql('meeting_apply').insert(
    { user_id: userId,
      meeting_time: meetingTime,
      role_type: roleType
    })

}