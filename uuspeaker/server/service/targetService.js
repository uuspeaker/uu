const { mysql } = require('../qcloud')
const studyDataService = require('../service/studyDataService.js')
const userInfoService = require('../service/userInfoService.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')

//保存用户目标
var saveTarget = async (userId, studyDuration, starAmount) => {
  var targetId = uuid.v1()
  await mysql('user_target').insert(
    {
      target_id: targetId,
      user_id: userId,
      target_status: 1,
      study_duration: studyDuration,
      star_amount: starAmount
    })
}

//查询用户目标
var getMyTarget = async (userId) => {
 var data = await mysql('user_target').where({
      user_id: userId,
      target_status: 1,
    })
    return data
}

//查询用户目标进展
var getTodayTargetProgress = async (userId) => {
  var hasTarget = 0
  var data = await getMyTarget(userId)
  if (data.length == 0){
    hasTarget = 0
  }else{
    hasTarget = 1
    var targetStarAmount = data[0].star_amount
    var todayStarAmount = await studyDataService.getStarAmountOfToday(userId)
  }
  var todayTargetProgress = {
    hasTarget: hasTarget,
    targetStarAmount: targetStarAmount,
    todayStarAmount: todayStarAmount
  }
  return todayTargetProgress
}

//查询用户目标进展
var getCurrentTargetProgress = async (userId) => {
  var hasTarget = 0
  var data = await getMyTarget(userId)
  if (data.length == 0){
    hasTarget = 0
  }else{
    hasTarget = 1
    var targetStarAmount = data[0].star_amount
    var targetStarDuration = data[0].study_duration
    var todayStarAmount = await studyDataService.getStarAmountOfToday(userId)
    var startDate = dateUtil.format(new Date(data[0].create_date),'yyyyMMdd')
    var currentLastDays = await studyDataService.getStarLastDays(userId, startDate, targetStarAmount)
  }
  var todayTargetProgress = {
    hasTarget: hasTarget,
    targetStarAmount: targetStarAmount,
    targetStarDuration: targetStarDuration,
    todayStarAmount: todayStarAmount,
    currentLastDays: currentLastDays,
  }
  return todayTargetProgress
}

module.exports = {
  saveTarget,
  getMyTarget,
  getTodayTargetProgress,
  getCurrentTargetProgress
}