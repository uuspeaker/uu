const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')
//const uuid = require('node-uuid')

/**
 * 获取用户ID 
 * ctx 前端的请求，用于获取登陆用户信息
 * 返回：用户ID
 */
var getOpenId = async (ctx) => {
  var skey = ctx.header['x-wx-skey']
  var openIds = await mysql('cSessionInfo').select('open_id').where({ 'skey': skey })
  return openIds[0].open_id
}

/**
 * 剪裁用户信息
 * userInfoStr 系统保存的原始用户信息
 * 返回：{nickName:用户昵称, avatarUrl:头像url}
 */
var getTailoredUserInfo = (userInfoStr) => {
  //return JSON.parse(userInfoStr)
  var userInfoTmp = JSON.parse(userInfoStr)
  var userInfo = {}
  userInfo.nickName = userInfoTmp.nickName
  userInfo.avatarUrl = userInfoTmp.avatarUrl
  return userInfo
}

//获取用户总积分 
var getTotalScore = async userId => {
  //获取用户积分总额
  var totalScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId })
  return totalScoreRes[0]['totalScore']
}

//获取用户参会积分 
var getMeetingScore = userId => {
  return getScore(userId,1)
}

//获取用户演讲积分 
var getSpeakerScore = userId => {
  return getScore(userId, 2)
}

//获取用户点评积分 
var getEvaluatorScore = userId => {
  return getScore(userId, 3)
}

//获取用户主持积分 
var getHostScore = userId => {
  return getScore(userId, 4)
}

//获取用户复盘积分 
var getReportScore = userId => {
  return getScore(userId, 5)
}

//根据积分类型获取用户参会积分
var getScore = async (userId,scoreType) => {
  var totalScoreRes = await mysql("user_score_detail").count('user_id as totalScore').where({ user_id: userId, score_type: scoreType })
  return totalScoreRes[0]['totalScore']
}

module.exports = { 
  getOpenId, 
  getTailoredUserInfo, 
  getTotalScore, 
  getMeetingScore, 
  getSpeakerScore,
  getEvaluatorScore,
  getHostScore,
  getReportScore
  }