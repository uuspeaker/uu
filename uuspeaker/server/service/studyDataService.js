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

module.exports = {
  getFirstStudyDate,
  getFirstSpeechDate,
  getStudyDays,
  getStudyAmount,
}