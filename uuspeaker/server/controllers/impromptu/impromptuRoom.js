const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const dateUtil = require('../../common/dateUtil.js')
const uuid = require('../../common/uuid.js');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var mode = ctx.request.body.mode
    var language = ctx.request.body.language
    var startDate = ctx.request.body.startDate
    var startTime = ctx.request.body.startTime
    var endTime = ctx.request.body.endTime

    await mysql('room_impromptu').insert(
      {
        room_id: uuid.v1(),
        user_id: userId,
        mode: mode,
        language: language,
        start_date: startDate,
        start_time: startTime,
        end_time: endTime
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
    var today = dateUtil.getFormatDate(new Date(), 'yyyy-MM-dd')
    var limit = 50
    var offset = 0

    var rooms = await mysql("room_impromptu").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'room_impromptu.user_id').select('room_impromptu.*', 'cSessionInfo.user_info').where('start_date', '>=', today).orderBy('room_impromptu.create_date', 'asc').limit(limit).offset(offset)
    ctx.state.data = rooms

    for (var i = 0; i < rooms.length; i++) {
      //获取复盘人用户昵称及头像
      rooms[i].user_info = userInfo.getUserInfo(rooms[i].user_info)
    }
  },

}