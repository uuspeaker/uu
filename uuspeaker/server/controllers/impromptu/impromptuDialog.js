const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var roomId = ctx.request.body.roomId
    var comment = ctx.request.body.comment

    await mysql('impromptu_dialog').insert(
      {
        dialog_id: uuid.v1(),    
        user_id: userId,
        room_id: roomId,
        comment: comment
      })

  },

  del: async ctx => {
    var dialogId = ctx.request.body.dialogId
    await mysql('impromptu_dialog').where({dialog_id: dialogId}).del()
  },

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var limit = 10
    var offset = 0
    var queryFlag = ctx.query.queryFlag
    var firstCommentTime = ctx.query.firstCommentTime
    var lastCommentTime = ctx.query.lastCommentTime
    var roomId = ctx.query.roomId

    var dialog = []
    if (queryFlag == 0) {
    dialog = await mysql('impromptu_dialog').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_dialog.user_id').select('impromptu_dialog.*', 'cSessionInfo.user_info').orderBy('impromptu_dialog.create_date', 'desc').limit(limit).offset(offset).where({ room_id: roomId })
    }
    if (queryFlag == 1) {
      dialog = await mysql('impromptu_dialog').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_dialog.user_id').select('impromptu_dialog.*', 'cSessionInfo.user_info').where('impromptu_dialog.create_date', '<', new Date(firstCommentTime)).orderBy('impromptu_dialog.create_date', 'desc').limit(limit).offset(offset).where({ room_id: roomId })
    }
    if (queryFlag == 2) {
      dialog = await mysql('impromptu_dialog').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_dialog.user_id').select('impromptu_dialog.*', 'cSessionInfo.user_info').where('impromptu_dialog.create_date', '>', new Date(lastCommentTime)).orderBy('impromptu_dialog.create_date', 'desc').where({ room_id: roomId })
    }

    for(var i=0; i<dialog.length; i++){
      dialog[i].user_info = userInfo.getUserInfo(dialog[i].user_info)
      dialog[i].isMine = 0
      if (userId == dialog[i].user_id) {
        dialog[i].isMine = 1
      }
    }
    dialog.reverse()
    ctx.state.data = dialog
  },

}