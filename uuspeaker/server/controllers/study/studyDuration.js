const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const dateUtil = require('../../common/dateUtil.js')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var studyDate = ctx.request.body.studyDate
    var studyDuration = ctx.request.body.studyDuration
    

    //删除原有记录
    await mysql('user_study_duration').where({
      user_id: userId,
      study_date: studyDate
    }).del()

    //更新参会记录
    if (studyDuration != '') {
      await mysql('user_study_duration').insert(
        {
          user_id: userId,
          study_date: studyDate,
          study_duration: studyDuration
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