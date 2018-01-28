const { mysql } = require('../qcloud')

module.exports = {
  post: async ctx => {
    var skey = ctx.header['x-wx-skey']
    var openIds = await mysql('cSessionInfo').select('open_id').where({ 'skey': skey })
    var userId = openIds[0].open_id
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

  }
}