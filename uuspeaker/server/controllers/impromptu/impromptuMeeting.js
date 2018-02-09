const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid.js');
var impromptuMeetingService = require('../../service/impromptuMeetingService');

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var roomId = ctx.request.body.roomId
    var roleType = ctx.request.body.roleType

    await mysql('meeting_apply').insert(
      {
        room_id: roomId,
        user_id: userId,
        role_type: roleType
      })
  },

  del: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var roomId = ctx.request.body.roomId

    //删除原有记录
    await mysql('meeting_apply').where({
      room_id: roomId,
      user_id: userId,
    }).del()
  },

  get: async ctx => {
    var hostId = ctx.query.hostId
    var roomId = ctx.query.roomId
    var userId = await userInfoService.getOpenId(ctx)
    var meetingUser = await impromptuMeetingService.getMeetingUser(roomId)
    var isJoin = false
    for(var i=0; i<meetingUser.length; i++){
      if(meetingUser[i].user_id == userId){
        isJoin = true
      }
    }
    ctx.state.data = {
      'hostTotalScore': await userInfoService.getTotalScore(hostId),
      'meetingUser': meetingUser,
      'isJoin': isJoin
    }
  },

}