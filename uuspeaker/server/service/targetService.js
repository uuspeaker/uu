const { mysql } = require('../qcloud')
const studyDataService = require('../service/studyDataService.js')
const userInfoService = require('../service/userInfoService.js')
const audioService = require('../service/audioService.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')

//保存用户目标
var saveTarget = async (userId, studyDuration, starAmount, audioId, timeDuration) => {
  var targetId = uuid.v1()
  await mysql('user_target').insert(
    {
      target_id: targetId,
      user_id: userId,
      target_status: 1,
      study_duration: studyDuration,
      star_amount: starAmount,
      audio_id: audioId,
      time_duration: timeDuration
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

//查询用户目标
var disposeTarget = async (targetId) => {
 var data = await mysql('user_target').where({
   target_id: targetId,
    }).update({'target_status':3})
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
  var lastDays = [7, 30, 90, 365]
  var data = await getMyTarget(userId)
  if (data.length == 0){
    return {'hasTarget' : 0}
  }else{
    data[0].hasTarget = 1
    data[0].todayStarAmount = await studyDataService.getStarAmountOfToday(userId)
    var startDateStr = dateUtil.format(new Date(data[0].create_date),'yyyyMMdd')

    var endDate = new Date(data[0].create_date)
    endDate.setHours(0)
    endDate.setMinutes(0)
    endDate.setSeconds(0)
    endDate.setMilliseconds(0)
    endDate.setDate(endDate.getDate() + lastDays[data[0].study_duration] -1)
    var endDateStr = dateUtil.format(endDate, 'yyyyMMdd')

    data[0].currentLastDays = await studyDataService.getStarLastDays(userId, startDateStr, endDateStr,data[0].star_amount)
    data[0].betweenDays = dateUtil.getBetweenDays(new Date(data[0].create_date),new Date())
    data[0].src = audioService.getSrc(data[0].audio_id)
    return data[0]
  }
}

module.exports = {
  saveTarget,
  getMyTarget,
  disposeTarget,
  getTodayTargetProgress,
  getCurrentTargetProgress
}