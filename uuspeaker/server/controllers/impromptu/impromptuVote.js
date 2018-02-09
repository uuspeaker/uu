const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid');
var impromptuRoomService = require('../../service/impromptuRoomService');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.request.body.roomId
    var bestSpeaker = ctx.request.body.bestSpeaker
    var bestEvaluator = ctx.request.body.bestEvaluator
    //var meetingUser = JSON.parse(meetingUserStr)
    await mysql('impromptu_vote').where({ room_id: roomId, user_id: userId}).del()
    await mysql('impromptu_vote').insert(
      {
        room_id: roomId,
        user_id: userId,
        best_speaker: bestSpeaker,
        best_evaluator: bestEvaluator,
      })
  },



}