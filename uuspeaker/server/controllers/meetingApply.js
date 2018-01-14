const { mysql } = require('../qcloud')

module.exports = {
  get: async ctx => {
    var userId = await ctx.query.userId
    ctx.state.data = await mysql('meeting_apply').where({ user_id: userId })
  },

  post: async ctx => {
    var userId = await ctx.request.body.userId
    var meetingTime = await ctx.request.body.meetingTime
    var roleType = await ctx.request.body.roleType
    await mysql('meeting_apply').insert(
      {
        user_id: userId,
        meeting_time: meetingTime,
        role_type: roleType
      })
  },

  put: async ctx => {
    var userId = ctx.request.body.userId
    var meetingTime = ctx.request.body.meetingTime
    var roleType = ctx.request.body.roleType
    await mysql('meeting_apply').where({ user_id: userId }).update(
      {
        meeting_time: meetingTime,
        role_type: roleType
      })
  },

  del: async ctx => {
    var userId = ctx.request.body.userId
    var meetingTime = ctx.request.body.meetingTime
    var roleType = ctx.request.body.roleType
    await mysql('meeting_apply').where({ user_id: userId }).del()
  }
}