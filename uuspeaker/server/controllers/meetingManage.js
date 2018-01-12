const { mysql } = require('../qcloud')

//查询报名
async function get(ctx, next) {
  var userId = ctx.query.userId
  var meetingTime = ctx.query.meetingTime
  var roleType = ctx.query.roleType
  await mysql('meeting_apply').insert(
    {
      user_id: userId,
      meeting_time: meetingTime,
      role_type: roleType
    })  
}

//提交报名
async function post(ctx, next) {
  var userId = ctx.query.userId
  var meetingTime = ctx.query.meetingTime
  var roleType = ctx.query.roleType
  await mysql('meeting_apply').insert(
    {
      user_id: userId,
      meeting_time: meetingTime,
      role_type: roleType
    })
}

//修改报名
async function put(ctx, next) {
  var userId = ctx.query.userId
  var meetingTime = ctx.query.meetingTime
  var roleType = ctx.query.roleType
  await mysql('meeting_apply').insert(
    {
      user_id: userId,
      meeting_time: meetingTime,
      role_type: roleType
    })
}

//取消报名
async function del(ctx, next) {
  var userId = ctx.query.userId
  var meetingTime = ctx.query.meetingTime
  var roleType = ctx.query.roleType
  await mysql('meeting_apply').insert(
    {
      user_id: userId,
      meeting_time: meetingTime,
      role_type: roleType
    })
}

module.exports = {
  get,
  post,
  put,
  del
}