const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const uuid = require('../common/uuid.js');

module.exports = {
  post: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var reportId = ctx.request.body.reportId
    var comment = ctx.request.body.comment

      await mysql('user_report_comment').insert(
        {
          comment_id: uuid.v1(),
          report_id: reportId,
          user_id: userId,
          comment: comment
        })

    //获取用户评论明细
      var reportCommentList = await mysql("user_report_comment").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_comment.user_id').select('user_report_comment.user_id', 'cSessionInfo.user_info', 'user_report_comment.comment_id','user_report_comment.comment','user_report_comment.create_date').where({ 'user_report_comment.report_id': reportId })
      ctx.state.data = reportCommentList  
      for (var j = 0; j < reportCommentList.length; j++) {
        reportCommentList[j].user_info = userInfo.getUserInfo(reportCommentList[j].user_info)
      } 

  },

  del: async ctx => {
    var commentId = ctx.request.body.commentId
    var report_id = ctx.request.body.report_id

    //删除原有记录
    await mysql('user_report_comment').where({
      commentId: commentId,
      report_id: reportId
    }).del()
  },

}