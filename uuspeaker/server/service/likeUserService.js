const { mysql } = require('../qcloud')
const userInfoService = require('../service/userInfoService.js')
const dateUtil = require('../common/dateUtil.js')


//关注用户
var likeUser = async (userId, likeUserId) => {
  await cancelLikeUser(userId, likeUserId)
  var data = await mysql('user_like').insert({
    user_id: userId,
    like_user_id: likeUserId
  })
}

//取消关注用户
var cancelLikeUser = async (userId, likeUserId) => {
  var data = await mysql('user_like').where({
    user_id: userId,
    like_user_id: likeUserId
  }).del()
}

//查询是否关注用户
var isLikeUser = async (userId, likeUserId) => {
  var data = await mysql('user_like').where({
    user_id: userId,
    like_user_id: likeUserId
  })
  if (data.length == 0) {
    return 0
  } else {
    return 1
  }
}

//查询我关注的用户数量
var getLikeUserTotal = async (userId) => {
  var data = await mysql('user_like').where({
    user_id: userId
  }).select(mysql.raw('count(1) as totalAmount'))
  if (data[0].totalAmount == null) {
    return 0
  } else {
    return data[0].totalAmount
  }
}

//查询关注我的用户数量
var getMyFansTotal = async (userId) => {
  var data = await mysql('user_like').where({
    like_user_id: userId
  }).select(mysql.raw('count(1) as totalAmount'))
  if (data[0].totalAmount == null) {
    return 0
  } else {
    return data[0].totalAmount
  }
}

//查询我关注的用户
var getLikeUserList = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var data = []
  if (queryPageType == 0) {
    data = await mysql('user_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.like_user_id')
      .where({ 'user_like.user_id': userId }).select('cSessionInfo.user_info', 'user_like.create_date').orderBy('user_like.create_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 1) {
    data = await mysql('user_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.like_user_id')
      .where({ 'user_like.user_id': userId }).andWhere('user_like.create_date', '<', new Date(firstDataTime)).select('cSessionInfo.user_info', 'user_like.create_date').orderBy('user_like.create_date', 'asc').limit(limit).offset(offset)
  }
  if (queryPageType == 2) {
    data = await mysql('user_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.like_user_id')
      .where({ 'user_like.user_id': userId }).andWhere('user_like.create_date', '>', new Date(lastDataTime)).select('cSessionInfo.user_info', 'user_like.create_date').orderBy('user_like.create_date', 'asc').limit(limit).offset(offset)
  }

  for (var i = 0; i < data.length; i++) {
    data[i].user_info = userInfoService.getTailoredUserInfo(data[i].user_info)
  }
  return data
}

//查询我的粉丝
var getMyFansList = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var data = []
  if (queryPageType == 0) {
    data = await mysql('user_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.user_id')
      .where({ 'user_like.like_user_id': userId }).select('cSessionInfo.user_info', 'user_like.create_date').orderBy('user_like.create_date', 'desc').limit(limit).offset(offset)
  }
  if (queryPageType == 1) {
    data = await mysql('user_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.user_id')
      .where({ 'user_like.like_user_id': userId }).andWhere('user_like.create_date', '>', new Date(firstDataTime)).select('cSessionInfo.user_info', 'user_like.create_date').orderBy('user_like.create_date', 'desc').limit(limit).offset(offset)
  }
  if (queryPageType == 2) {
    data = await mysql('user_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.user_id')
      .where({ 'user_like.like_user_id': userId }).andWhere('user_like.create_date', '<', new Date(lastDataTime)).select('cSessionInfo.user_info', 'user_like.create_date').orderBy('user_like.create_date', 'desc').limit(limit).offset(offset)
  }

  for (var i = 0; i < data.length; i++) {
    data[i].user_info = userInfoService.getTailoredUserInfo(data[i].user_info)
  }
  return data
}


//查询用户学习排名
var getStudyRankOfLike = async (userId) => {
  var limit = 100
  var offset = 0
  var data = await mysql('user_like').innerJoin('user_study_duration', 'user_like.like_user_id', 'user_study_duration.user_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.like_user_id').where({
    'user_like.user_id': userId
  }).select('cSessionInfo.user_info', mysql.raw('sum(study_duration) as totalDuration')).groupBy('cSessionInfo.user_info').orderBy('totalDuration', 'desc').limit(limit).offset(offset)
  for (var i = 0; i < data.length; i++) {
    data[i].user_info = userInfoService.getTailoredUserInfo(data[i].user_info)
  }
  return data
}

//查询用户学习增长排名
var getIncreaseRankOfLike = async (userId, scoreType) => {
  var beginDate = ''
  var limit = 100
  var offset = 0
  if (scoreType == 2) {
    beginDate = dateUtil.getToday()
  } else if (scoreType == 3) {
    beginDate = dateUtil.getFirstDayOfWeek()
  } else if (scoreType == 4) {
    beginDate = dateUtil.getFirstDayOfMonth()
  }
  console.log('scoreType', scoreType)
  console.log('beginDate', beginDate)
  var data = await mysql('user_like').innerJoin('user_study_duration', 'user_like.like_user_id', 'user_study_duration.user_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_like.like_user_id').where({
    'user_like.user_id': userId
  }).andWhere('user_study_duration.study_date', '>=', beginDate).select('cSessionInfo.user_info', mysql.raw('sum(study_duration) as totalDuration')).groupBy('cSessionInfo.user_info').orderBy('totalDuration', 'desc').limit(limit).offset(offset)
  for (var i = 0; i < data.length; i++) {
    data[i].user_info = userInfoService.getTailoredUserInfo(data[i].user_info)
  }
  return data
}

//查询用户学习排名
var getStudyStarOfLike = async (userId) => {
  var limit = 100
  var offset = 0
  var data = await mysql.raw('select user_info,sum(star_amount) as totalStarAmount from (SELECT user_study_duration.user_id,study_date,min(study_amount) as star_amount FROM user_study_duration,user_like WHERE user_like.user_id = ? and user_study_duration.user_id = user_like.like_user_id group by user_id,study_date HAVING count(study_type) =4) user_star,cSessionInfo where user_id = open_id group by user_info order by totalStarAmount desc',userId)
  var starData = data[0]
  for (var i = 0; i < starData.length; i++) {
    starData[i].user_info = userInfoService.getTailoredUserInfo(starData[i].user_info)
  }
  return starData
}


module.exports = {
  likeUser,
  cancelLikeUser,
  isLikeUser,
  getLikeUserTotal,
  getMyFansTotal,
  getLikeUserList,
  getMyFansList,
  getStudyRankOfLike,
  getIncreaseRankOfLike,
  getStudyStarOfLike
}