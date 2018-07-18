const { mysql } = require('../qcloud')
const audioService = require('../service/audioService.js')
const dateUtil = require('../common/dateUtil.js')

//查询用户学习总时间
var getTotalStudyDuration = async (userId) => {
  var data = await mysql('user_study_duration').where({
    user_id: userId,
  }).select(mysql.raw('sum(study_duration) as totalDuration'))
  if (data[0].totalDuration == null) {
    return 0
  } else {
    return data[0].totalDuration
  }
}

//查询用户学习总时间
var getTodayStudyDuration = async (userId) => {
  var today = dateUtil.format(new Date(), 'yyyyMMdd')
  var data = await mysql('user_study_duration').where({
    user_id: userId
  }).andWhere('user_study_duration.study_date', '=', today).select(mysql.raw('sum(study_duration) as totalDuration'))
  if (data[0].totalDuration == null) {
    return 0
  } else {
    return data[0].totalDuration
  }
}

//查询用户学习总时间
var getTotalStudyInfo = async (userId) => {
  var data = await mysql('user_study_duration').where({
    user_id: userId
  }).groupBy('study_type').select('study_type', mysql.raw('sum(study_duration) as totalDuration'), mysql.raw('sum(study_amount) as totalAmount'))
  return data
}

//查询用户学习总时间
var getTodayStudyInfo = async (userId) => {
  var today = dateUtil.format(new Date(), 'yyyyMMdd')
  var data = await mysql('user_study_duration').where({
    user_id: userId
  }).andWhere('study_date', '=', today).groupBy('study_type').select('study_type', mysql.raw('sum(study_duration) as totalDuration'), mysql.raw('sum(study_amount) as totalAmount'))
  return data
}


//查询用户积分数据
var getStudyReport = async (userId) => {
  var limit = 7
  var offset = 0
  var data = await mysql('user_study_duration').where({ 'user_id': userId }).select('study_date', mysql.raw('sum(study_duration) as totalDuration')).groupBy('study_date').orderBy('study_date', 'desc').limit(limit).offset(offset)
  return data
}
//查询用户当天学习报告
var getStudyReportToday = async (userId) => {
  var today = dateUtil.getToday()
  var data = await mysql('user_study_duration').where({ 'user_id': userId, 'study_date': today })
  return data
}

//查询优质学习次数
var getStarAmount = async (userId) => {
  var data = await mysql.raw('select sum(star_amount) as totalStarAmount from (SELECT user_id,study_date,min(study_amount) as star_amount FROM user_study_duration WHERE user_id = ?  group by user_id,study_date HAVING count(study_type) =4) user_star', userId)
  var starData = data[0][0]
  return starData.totalStarAmount
}

//查询优质学习列表
var getStarList = async (userId) => {
  var limit = 50
  var offset = 0
  var data = await mysql.raw('SELECT user_id,study_date,min(study_amount) as star_amount FROM user_study_duration WHERE user_id = ?  group by user_id,study_date HAVING count(study_type) =4 order by study_date desc limit ? offset ?', [userId,limit,offset])
  console.log('getStarList', data)
  var starData = data[0]
  return starData
}

module.exports = {
  getTotalStudyDuration,
  getTodayStudyDuration,
  getTotalStudyInfo,
  getTodayStudyInfo,
  getStudyReport,
  getStudyReportToday,
  getStarAmount,
  getStarList
}