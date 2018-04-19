const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const dateUtil = require('../../common/dateUtil.js')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var today = new Date()
    var studyDate = dateUtil.format(today, 'yyyyMMdd')
    var increaseStudyDuration = ctx.request.body.studyDuration
    
    var todayPastStudyDuration = await mysql('user_study_duration').where({
      user_id: userId,
      study_date: studyDate
    })

    var todayTotalStudyDuration = 0
    if (todayPastStudyDuration.length == 0){
      await mysql('user_study_duration').insert(
        {
          user_id: userId,
          study_date: studyDate,
          study_duration: todayPastStudyDuration[0].study_duration + increaseStudyDuration
        })
    }else{
      await mysql('user_study_duration').update(
        {study_duration: increaseStudyDuration})
        .where({
          user_id: userId,
          study_date: studyDate
        })
    }

  },

  get: async ctx => {
    //查询用户ID
    var userId = await userInfo.getOpenId(ctx)
    //获取用户参会明细
    var durationDetail = await mysql("user_study_duration").select('study_date', 'study_duration').where({ user_id: userId }).orderBy('study_date', 'desc')
    ctx.state.data = durationDetail
  }
}