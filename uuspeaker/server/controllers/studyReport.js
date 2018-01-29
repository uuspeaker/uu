const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var studyDate = ctx.request.body.studyDate
    var title = ctx.request.body.title
    var studyReprot = ctx.request.body.studyReport

    //删除原有记录
    await mysql('user_study_report').where({
      user_id: userId,
      study_date: studyDate
    }).del()

    //更新参会记录
    if (studyReprot != '') {
      await mysql('user_study_report').insert(
        {
          user_id: userId,
          study_date: studyDate,
          title: title,
          study_report: studyReprot
        })
    }
  },

  get: async ctx => {
    //查询用户ID
    var userId = await userInfo.getOpenId(ctx)
    //获取用户参会明细
    var studyReport = await mysql("user_study_report").select('study_date', 'title','study_report').where({ user_id: userId }).orderBy('study_date', 'desc')
    ctx.state.data = studyReport
  }
}