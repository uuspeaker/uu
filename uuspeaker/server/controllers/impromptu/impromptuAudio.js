const { mysql } = require('../../qcloud')
const uploadAudio = require('../../upload/uploadAudio.js')
const uuid = require('../../common/uuid.js')
const userInfo = require('../../common/userInfo')
const multiparty = require('multiparty')

module.exports = async ctx => {
  var audioId = uuid.v1()
  const data = uploadAudio.upload(ctx.req)

  ctx.state.data = data
}
