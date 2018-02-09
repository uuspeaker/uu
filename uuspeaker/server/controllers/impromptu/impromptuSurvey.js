const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid');
var impromptuRoomService = require('../../service/impromptuRoomService');

module.exports = {
  post: async ctx => {
    var roomId = ctx.request.body.roomId
    var meetingUserStr = ctx.request.body.meetingUser
    //var meetingUser = JSON.parse(meetingUserStr)
    await mysql('impromptu_survey').where({room_id: roomId,}).del()
    await mysql('impromptu_survey').insert(
      {
        room_id: roomId,
        meeting_user: meetingUserStr
      })
    await mysql('room_impromptu').update(
      {
        survey_status: 2
      }).where({ room_id: roomId, })
  },

  get: async ctx => {
    var roomId =  ctx.query.roomId
    var meetingUser = await mysql('impromptu_survey').select('meeting_user').where({ room_id: roomId, })
    ctx.state.data = meetingUser[0].meeting_user
  },

}