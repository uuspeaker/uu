const { mysql } = require('../qcloud')
const audioService = require('../service/audioService.js')
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

module.exports = {
  saveTarget,
  getMyTarget
  
}