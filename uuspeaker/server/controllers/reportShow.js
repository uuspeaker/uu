const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    var limit = 5
    var offset = 0
    var queryFlag = ctx.query.queryFlag
    var firstReportTime = ctx.query.firstReportTime
    var lastReportTime = ctx.query.lastReportTime
    //获取用户复盘明细
    var studyReport = []
    //查询最近10条信息
    if (queryFlag == 0){
      studyReport = await mysql("user_study_report").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_study_report.user_id').select('user_study_report.report_id', 'cSessionInfo.user_info', 'user_study_report.study_date', 'user_study_report.study_report', 'user_study_report.create_date').orderBy('user_study_report.create_date', 'desc').limit(limit).offset(offset)
    }
    //查询前10条信息,此种方式会导致10(limit)条之外的数据无法查询到,因影响不大,使用此种简单但不完备的方式
    if (queryFlag == 1) {
      studyReport = await mysql("user_study_report").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_study_report.user_id').select('user_study_report.report_id', 'cSessionInfo.user_info', 'user_study_report.study_date', 'user_study_report.study_report', 'user_study_report.create_date').orderBy('user_study_report.create_date', 'desc').where('user_study_report.create_date', '>', new Date(firstReportTime)).limit(limit).offset(offset)
    }
    //查询后10条信息
    if (queryFlag == 2) {
      studyReport = await mysql("user_study_report").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_study_report.user_id').select('user_study_report.report_id', 'cSessionInfo.user_info', 'user_study_report.study_date', 'user_study_report.study_report', 'user_study_report.create_date').orderBy('user_study_report.create_date', 'desc').where('user_study_report.create_date', '<', new Date(lastReportTime)).limit(limit).offset(offset)
    }

    ctx.state.data = studyReport
    
    for(var i=0; i<studyReport.length; i++){
      //获取复盘人用户昵称及头像
      studyReport[i].user_info = userInfo.getUserInfo(studyReport[i].user_info)
      //查询出所有点赞的人，并附到每一条复盘上
      var likeUser = await mysql("user_report_like").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_like.user_id').select('user_report_like.user_id', 'cSessionInfo.user_info').where({'user_report_like.report_id':studyReport[i].report_id})
      studyReport[i].nickNameLikeList = likeUser

      //若登陆人有对此条复盘点赞，做个标记
      studyReport[i].like = 0
      for (var j = 0; j < likeUser.length; j++){
        //获取点赞人用户昵称及头像
        likeUser[j].user_info = userInfo.getUserInfo(likeUser[j].user_info)
        if(userId == likeUser[j].user_id){
          studyReport[i].like = 1
          break
        }
      }  

      //查询出此条复盘所有的评论，并附到每一条复盘上
      var commentList = await mysql("user_report_comment").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_comment.user_id').select('user_report_comment.user_id', 'cSessionInfo.user_info', 'user_report_comment.comment_id','user_report_comment.comment', 'user_report_comment.create_date').where({ 'user_report_comment.report_id': studyReport[i].report_id })
      studyReport[i].commentList = commentList
      //若登陆人有对此条复盘评论，做个标记
      for (var j = 0; j < commentList.length; j++) {
        commentList[j].user_info = userInfo.getUserInfo(commentList[j].user_info)
        if (userId == commentList[j].user_id) {
          commentList[j].isMyComment = 1
        }else{
          commentList[j].isMyComment = 0
        }
      }
    }
  }
}