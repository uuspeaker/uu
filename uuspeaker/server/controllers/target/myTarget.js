const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid');
var impromptuRoomService = require('../../service/impromptuRoomService');

module.exports = {
  post: async ctx => {
    var targetId = uuid.v1()
    var userId = await userInfo.getOpenId(ctx)
    var targetContent = ctx.request.body.targetContent
    var duration = ctx.request.body.duration
    var endDate = ctx.request.body.endDate
    var isSupervised = ctx.request.body.isSupervised

    //var meetingUser = JSON.parse(meetingUserStr)
    await mysql('user_target').where({ target_id: targetId, }).del()
    await mysql('user_target').insert(
      {
        target_id: targetId,
        user_id: userId,
        target_content: targetContent,
        duration: duration,
        end_date: endDate,
        is_supervised: isSupervised,
        target_status: 1
      })
  },

  put: async ctx => {
    var targetStatus = ctx.request.body.targetStatus
    await mysql('user_target').update({ target_status: targetStatus}).where({ target_id: targetId, })

  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var myTarget = await mysql('user_target').where({user_id: userId})
    ctx.state.data = myTarget[0]
  },

}