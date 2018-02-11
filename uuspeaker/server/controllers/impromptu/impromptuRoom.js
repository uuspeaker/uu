const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid');
var impromptuRoomService = require('../../service/impromptuRoomService');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
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

  put: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.request.body.roomId
    var mode = ctx.request.body.mode
    var language = ctx.request.body.language
    var startDate = ctx.request.body.startDate
    var startTime = ctx.request.body.startTime
    var endTime = ctx.request.body.endTime
    var notice = ctx.request.body.notice

    await mysql('room_impromptu').update(
      {
        mode: mode,
        language: language,
        start_date: startDate,
        start_time: startTime,
        end_time: endTime,
        notice: notice
      }).where({
        room_id: roomId,
        user_id: userId
      })

  },

  del: async ctx => {
    var roomId = ctx.request.body.roomId
    var userId = await userInfo.getOpenId(ctx)

    //删除原有记录
    await mysql('room_impromptu').where({
      room_id: roomId,
      user_id: userId
    }).del()
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var rooms = await impromptuRoomService.getRooms()

    for(var i=0; i<rooms.length; i++){
      if(rooms[i].user_id == userId){
        rooms[i].isHost = true
      }else{
        rooms[i].isHost = false
      }
    }
    ctx.state.data = rooms
  },

}