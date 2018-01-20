const { mysql } = require('../qcloud')

module.exports = {
  get: async ctx => {
    var userId = await ctx.query.userId
    var meetingDate = await ctx.query.meetingDate
    ctx.state.data = await mysql('meeting_apply').where({ user_id: userId, meeting_date: meetingDate })
  },

  post: async ctx => {
    var userId = await ctx.request.body.userId
    var meetingDate = await ctx.request.body.meetingDate
    var meetingTime = await ctx.request.body.meetingTime
    var roleType = await ctx.request.body.roleType
    var meetingType = await ctx.request.body.meetingType
    await mysql('meeting_apply').where({ 
      user_id: userId,
      meeting_date: meetingDate,
      meeting_time: meetingTime 
      }).del()
    await mysql('meeting_apply').insert(
      {
        user_id: userId,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        role_type: roleType,
        meeting_type: meetingType
      })
  },

  put: async ctx => {
    var userId = ctx.request.body.userId
    var meetingDate = await ctx.request.body.meetingDate
    var meetingTime = ctx.request.body.meetingTime
    var roleType = ctx.request.body.roleType
    await mysql('meeting_apply').where({ 
        user_id: userId, 
        meeting_date: meetingDate
      }).update({
        meeting_time: meetingTime,
        role_type: roleType,
        meeting_type: meetingType
      })
  },

  del: async ctx => {
    var userId = ctx.request.body.userId
    var meetingDate = await ctx.request.body.meetingDate
    var meetingTime = ctx.request.body.meetingTime
    var roleType = ctx.request.body.roleType
    await mysql('meeting_apply').where({ 
      user_id: userId, 
      meeting_date: meetingDate, 
      meeting_time: meetingTime 
      }).del()
  }
}