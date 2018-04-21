const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService')
const uuid = require('../../common/uuid.js');
var impromptuMeetingService = require('../../service/impromptuMeetingService');

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var roomId = ctx.request.body.roomId
    var roleType = ctx.request.body.roleType

    await impromptuMeetingService.joinMeeting(roomId, userId, roleType)

  },

  del: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var roomId = ctx.request.body.roomId

    //删除原有记录
    await mysql('meeting_apply').where({
      room_id: roomId,
      user_id: userId,
    }).del()

    var amount = await mysql('meeting_apply').count('user_id as amount').where({ room_id: roomId })

    await mysql('impromptu_room').update({
      people_amount: amount[0].amount
    }).where({ room_id: roomId })

    // await mysql('impromptu_room').update({
    //   people_amount: people_amount - 1
    // }).where({ room_id: roomId })
  },

  get: async ctx => {
    var roomId = ctx.query.roomId
    var userId = await userInfoService.getOpenId(ctx)
    var meetingUser = await impromptuMeetingService.getMeetingUser(roomId)
    var roomInfo = await mysql('impromptu_room').where({ room_id: roomId })
    roomInfo[0].userInfo = await userInfoService.getUserInfo(roomInfo[0].user_id)
    var isJoin = false
    var isHost = false
    if (roomInfo[0].user_id == userId) {
      isHost = true
    }
    for(var i=0; i<meetingUser.length; i++){
      if(meetingUser[i].user_id == userId){
        isJoin = true
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
      //'hostTotalScore': await userInfoService.getTotalStudyDuration(roomInfo[0].user_id),
      'meetingUser': meetingUser,
      'isJoin': isJoin,
      'roomInfo': roomInfo[0],
      'isHost': isHost
    }
  },

}