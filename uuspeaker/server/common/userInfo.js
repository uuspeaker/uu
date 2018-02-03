const { mysql } = require('../qcloud')

var getOpenId = async (ctx) => {
  var skey = ctx.header['x-wx-skey']
  var openIds = await mysql('cSessionInfo').select('open_id').where({ 'skey': skey })
  return  openIds[0].open_id
}

var getUserInfo =  (userInfoStr) => {
  //return JSON.parse(userInfoStr)
  var userInfoTmp = JSON.parse(userInfoStr)
  var userInfo = {}
  userInfo.nickName = userInfoTmp.nickName
  userInfo.avatarUrl = userInfoTmp.avatarUrl
  return userInfo
}

module.exports = { getOpenId,getUserInfo}