const { mysql } = require('../qcloud')

var getOpenId = async (ctx) => {
  var skey = ctx.header['x-wx-skey']
  var openIds = await mysql('cSessionInfo').select('open_id').where({ 'skey': skey })
  return openIds[0].open_id
}

module.exports = { getOpenId}