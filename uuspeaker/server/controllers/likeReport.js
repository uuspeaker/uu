const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var reportId = ctx.request.body.reportId
    var like = ctx.request.body.like

    //删除原有记录
    if(like == 0){
      await mysql('user_report_like').where({
        user_id: userId,
        report_id: reportId
      }).del()
    }
    
    if(like == 1){
      await mysql('user_report_like').insert(
        {
          report_id: reportId,
          user_id: userId
        })
    }
    //获取用户参会明细
    var reportLikeList = await mysql("user_report_like").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_like.user_id').select('user_report_like.user_id', 'cSessionInfo.user_info').where({ 'user_report_like.report_id': reportId })
    ctx.state.data = reportLikeList
    for (var j = 0; j < reportLikeList.length; j++) {
      reportLikeList[j].user_info = userInfo.getUserInfo(reportLikeList[j].user_info)
    }  

  },

  del: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var reportId = ctx.request.body.reportId

    //删除原有记录
    await mysql('user_report_like').where({
      user_id: userId,
      report_id: reportId
    }).del()
  },

  get: async ctx => {
    //查询用户ID
    var reportId = ctx.request.body.reportId
    //获取用户参会明细
   
  }
}