const { mysql } = require('../../qcloud')
const userInfoService = require('../../service/userInfoService.js')
const dateUtil = require('../../common/dateUtil.js')
const uuid = require('../../common/uuid.js');

module.exports = {
  post: async ctx => {
    var userId = await userInfoService.getOpenId(ctx)
    var mode = ctx.request.body.mode
    var language = ctx.request.body.language
    var startDate = ctx.request.body.startDate
    var startTime = ctx.request.body.startTime
    var endTime = ctx.request.body.endTime
    var notice = ctx.request.body.notice

    await mysql('room_impromptu').insert(
      {
        room_id: uuid.v1(),
        user_id: userId,
        mode: mode,
        language: language,
        start_date: startDate,
        start_time: startTime,
        end_time: endTime,
        notice: notice
      })

  },

  del: async ctx => {
    var commentId = ctx.request.body.commentId
    var report_id = ctx.request.body.report_id

    //删除原有记录
    await mysql('user_report_comment').where({
      commentId: commentId,
      report_id: reportId
    }).del()
  },

  get: async ctx => {
    var userId = ctx.query.userId
    var roomId = ctx.query.roomId
    ctx.state.data = {
      'hostTotalScore': await userInfoService.getTotalScore(userId),
    }


  },

}