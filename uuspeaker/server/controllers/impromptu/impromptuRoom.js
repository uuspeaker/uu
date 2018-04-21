const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
var impromptuRoomService = require('../../service/impromptuRoomService');
var impromptuMeetingService = require('../../service/impromptuMeetingService');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var title = ctx.request.body.title
    var maxAmount = ctx.request.body.maxAmount
    var startDate = ctx.request.body.startDate
    var startTime = ctx.request.body.startTime
    var endTime = ctx.request.body.endTime
    var notice = ctx.request.body.notice

    var startDateDB = new Date(startDate + ' ' + startTime + ':00')
    var endDateDB = new Date(startDate + ' ' + endTime + ':00')
    var roomId = uuid.v1()
    await mysql('impromptu_room').insert(
      {
        room_id: roomId,
        user_id: userId,
        title: title,
        max_amount: maxAmount,
        start_date: startDateDB,
        end_date: endDateDB,
        notice: notice
      })

    await impromptuMeetingService.joinMeeting(roomId, userId, 2)
  },

  put: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.request.body.roomId
    var title = ctx.request.body.title
    var maxAmount = ctx.request.body.maxAmount
    var startDate = ctx.request.body.startDate
    var startTime = ctx.request.body.startTime
    var endTime = ctx.request.body.endTime
    var notice = ctx.request.body.notice

    var startDateDB = new Date(startDate + ' ' + startTime + ':00')
    var endDateDB = new Date(startDate + ' ' + endTime + ':00')

    await mysql('impromptu_room').update(
      {
        start_date: startDateDB,
        end_date: endDateDB,
        title: title,
        notice: notice,
        max_amount: maxAmount
      }).where({
        room_id: roomId,
        user_id: userId
      })

  },

  del: async ctx => {
    var roomId = ctx.request.body.roomId
    var userId = await userInfo.getOpenId(ctx)

    //删除原有记录
    await mysql('impromptu_room').where({
      room_id: roomId,
      user_id: userId
    }).del()
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    //1查询最近的 2查询自己的 3查询自己参与的 4查询自己关注的
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstDataTime = ctx.query.firstDataTime
    var lastDataTime = ctx.query.lastDataTime
    var roomData = []
  
    if (queryUserType == 1){
      roomData = await impromptuRoomService.getLastestRooms(queryPageType, firstDataTime, lastDataTime)
    }
    if (queryUserType == 2) {
      roomData = await impromptuRoomService.getMyRooms(userId, queryPageType, firstDataTime, lastDataTime)
    }
    if (queryUserType == 3) {
      roomData = await impromptuRoomService.getMyJoinRooms(userId, queryPageType, firstDataTime, lastDataTime)
    }
    if (queryUserType == 4) {
      roomData = await impromptuRoomService.getRoomsOfLikeUser(userId, queryPageType, firstDataTime, lastDataTime)
    }
    
    for (var i = 0; i < roomData.length; i++){
      if (roomData[i].user_id == userId){
        roomData[i].isHost = true
      }else{
        roomData[i].isHost = false
      }
    }
    ctx.state.data = roomData
  },

}