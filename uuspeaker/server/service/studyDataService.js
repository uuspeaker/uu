const { mysql } = require('../qcloud')
const userInfoService = require('../service/userInfoService.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')
const config = require('../config')

//查询用户首次学习时间
var getFirstStudyDate = async (userId) => {
  var data = await mysql('impromptu_audio').select(mysql.raw("min(create_date) as firstStudyDate")).where({user_id: userId})
  if(data.length > 0 ){
    return data[0].firstStudyDate
  }
  return 0 
}

//查询用户首次演讲时间
var getFirstSpeechDate = async (userId) => {
  var data = await mysql('impromptu_audio').select(mysql.raw("min(create_date) as firstSpeechDate")).where({user_id: userId,audio_type:1})
  if(data.length > 0 ){
    return data[0].firstSpeechDate
  }
  return 0 
}

//查询用户学习天数
var getStudyDays = async (userId) => {
  var data = await mysql('user_study_duration').distinct('study_date').where({ user_id: userId })
  return data.length
}

//查询用户练习次数
var getStudyAmount = async (userId) => {
  var data = await mysql('user_study_duration').select(mysql.raw("sum(study_amount) as totalAmount")).where({ user_id: userId })
  return data[0].totalAmount

}

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
var getStudyReportTotal = async (userId) => {
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
  var data = await mysql.raw('SELECT user_id,study_date,min(study_amount) as star_amount FROM user_study_duration WHERE user_id = ?  group by user_id,study_date HAVING count(study_type) =4 order by study_date desc limit ? offset ?', [userId, limit, offset])
  console.log('getStarList', data)
  var starData = data[0]
  return starData
}

module.exports = {
  getFirstStudyDate,
  getFirstSpeechDate,
  getStudyDays,
  getStudyAmount,
  getTotalStudyDuration,
  getTodayStudyDuration,
  getTotalStudyInfo,
  getTodayStudyInfo,
  getStudyReportTotal,
  getStudyReportToday,
  getStarAmount,
  getStarList
}