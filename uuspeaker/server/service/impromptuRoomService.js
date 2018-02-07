const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')

/**
 * 获取房间及房主信息 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getRooms = async (ctx) => {
  var today = dateUtil.getFormatDate(new Date(), 'yyyy-MM-dd')
  var limit = 50
  var offset = 0

  var rooms = await mysql("room_impromptu").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'room_impromptu.user_id').select('room_impromptu.*', 'cSessionInfo.user_info').where('start_date', '>=', today).orderBy('room_impromptu.create_date', 'asc').limit(limit).offset(offset)

  for (var i = 0; i < rooms.length; i++) {
    //获取复盘人用户昵称及头像
    rooms[i].user_info = userInfo.getUserInfo(rooms[i].user_info)
  }
  return rooms
}

module.exports = { getRooms }