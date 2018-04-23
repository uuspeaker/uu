const { mysql } = require('../qcloud')
const userInfoService = require('../service/userInfoService.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')

/**
 * 获取房间及房主信息 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getLastestRooms = async (queryPageType, firstDataTime, lastDataTime) => {
  var now = new Date()
  // now.setHours(0)
  // now.setMinutes(0)
  var limit = 10
  var offset = 0
  var rooms
  if (queryPageType == 0){
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('impromptu_room.end_date', '>', now).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType ==1) {
    if (firstDataTime == '') {
      var now = new Date()
      now.setFullYear(9999)
      firstDataTime = now.toString()
    }
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('impromptu_room.start_date', '<', new Date(firstDataTime)).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 2) {
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('impromptu_room.start_date', '>', new Date(lastDataTime)).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }

  for (var i = 0; i < rooms.length; i++) {
    //获取用户昵称及头像
    rooms[i].user_info = userInfoService.getTailoredUserInfo(rooms[i].user_info)
  }
  return rooms
}

/**
 * 获取我创建的房间 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getMyRooms = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var now = new Date()
  now.setHours(0)
  now.setMinutes(0)
  var limit = 10
  var offset = 0
  var rooms
  if (queryPageType == 0) {
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('impromptu_room.start_date', '>', now).andWhere({ 'impromptu_room.user_id': userId}).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 1) {
    if (firstDataTime == '') {
      var now = new Date()
      now.setFullYear(9999)
      firstDataTime = now.toString()
    }
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('impromptu_room.start_date', '<', new Date(firstDataTime)).andWhere({ 'impromptu_room.user_id': userId }).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 2) {
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('impromptu_room.start_date', '>', new Date(lastDataTime)).andWhere({ 'impromptu_room.user_id': userId }).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }

  for (var i = 0; i < rooms.length; i++) {
    //获取用户昵称及头像
    rooms[i].user_info = userInfoService.getTailoredUserInfo(rooms[i].user_info)
  }
  return rooms
}

/**
 * 获取我创建的房间 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getMyJoinRooms = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var now = new Date()
  // now.setHours(0)
  // now.setMinutes(0)
  var limit = 10
  var offset = 0
  var rooms
  if (queryPageType == 0) {
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').innerJoin('meeting_apply', 'meeting_apply.room_id', 'impromptu_room.room_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('meeting_apply.user_id', '=', userId).where('impromptu_room.end_date', '>', now).orderBy('impromptu_room.start_date','asc').limit(limit).offset(offset)
  }
  if (queryPageType == 1) {
    if (firstDataTime == ''){
      var now = new Date()
      now.setFullYear(9999)
      firstDataTime = now.toString()
    }
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').innerJoin('meeting_apply', 'meeting_apply.room_id', 'impromptu_room.room_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('meeting_apply.user_id', '=', userId).where('impromptu_room.start_date', '<', new Date(firstDataTime)).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 2) {
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').innerJoin('meeting_apply', 'meeting_apply.room_id', 'impromptu_room.room_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('meeting_apply.user_id', '=', userId).where('impromptu_room.start_date', '>', new Date(lastDataTime)).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }

  for (var i = 0; i < rooms.length; i++) {
    //获取用户昵称及头像
    rooms[i].user_info = userInfoService.getTailoredUserInfo(rooms[i].user_info)
  }
  return rooms
}

var getRoomsOfLikeUser = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var now = new Date()
  var limit = 10
  var offset = 0
  var rooms
  if (queryPageType == 0) {
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').innerJoin('user_like', 'user_like.like_user_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('user_like.user_id', '=', userId).andWhere('impromptu_room.end_date', '>', now).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 1) {
    if (firstDataTime == '') {
      var now = new Date()
      now.setFullYear(9999)
      firstDataTime = now.toString()
    }
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').innerJoin('user_like', 'user_like.like_user_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('user_like.user_id', '=', userId).andWhere('impromptu_room.start_date', '<', new Date(firstDataTime)).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 2) {
    rooms = await mysql("impromptu_room").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_room.user_id').innerJoin('user_like', 'user_like.like_user_id', 'impromptu_room.user_id').select('impromptu_room.*', 'cSessionInfo.user_info').where('user_like.user_id', '=', userId).andWhere('impromptu_room.start_date', '>', new Date(lastDataTime)).orderBy('impromptu_room.start_date', 'asc').limit(limit).offset(offset)
  }

  for (var i = 0; i < rooms.length; i++) {
    //获取用户昵称及头像
    rooms[i].user_info = userInfoService.getTailoredUserInfo(rooms[i].user_info)
  }
  return rooms
}



module.exports = { getLastestRooms, getMyRooms, getMyJoinRooms, getRoomsOfLikeUser}