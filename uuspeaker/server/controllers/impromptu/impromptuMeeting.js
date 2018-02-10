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
    var roomId = ctx.query.roomId
    var userId = await userInfoService.getOpenId(ctx)
    var meetingUser = await impromptuMeetingService.getMeetingUser(roomId)
    var roomInfo = await mysql('room_impromptu').where({ room_id: roomId })
    roomInfo[0].userInfo = await userInfoService.getUserInfo(roomInfo[0].user_id)
    var isJoin = false
    var isHost = false
    for(var i=0; i<meetingUser.length; i++){
      if(meetingUser[i].user_id == userId){
        isJoin = true
      }
      if (roomInfo[0].user_id == userId) {
        isHost = true
      }
      //若投票已经完成则查询出本场最佳
      if (roomInfo[0].survey_status == 3){
        var bestUser = await mysql('user_score_detail').select('user_id', 'score_type').where({ room_id: roomId })
        for (var j = 0; j < bestUser.length; j++) {
          //标记最佳演讲者
          if (bestUser[j].user_id == meetingUser[i].user_id && bestUser[j].score_type == 2) {
            meetingUser[i].isBestSpeaker = true
          }
          //标记最佳演讲者
          if (bestUser[j].user_id == meetingUser[i].user_id && bestUser[j].score_type == 3) {
            meetingUser[i].isBestEvaluator = true
          }
        }
      }      
      
    }
    ctx.state.data = {
      'hostTotalScore': await userInfoService.getTotalScore(roomInfo[0].user_id),
      'meetingUser': meetingUser,
      'isJoin': isJoin,
      'roomInfo': roomInfo[0],
      'isHost': isHost
    }
  },

}