const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')

module.exports = {

  get: async ctx => {
    var userId = userInfo.getOpenId()
    var limit = 10
    var offset = 0
    //获取用户复盘明细
    var studyReport = await mysql("user_study_report").innerJoin('user_base_info', 'user_base_info.user_id', 'user_study_report.user_id').select('user_study_report.report_id', 'user_base_info.nick_name', 'user_study_report.study_date', 'user_study_report.title', 'user_study_report.study_report', 'user_study_report.create_date').orderBy('user_study_report.create_date', 'desc').limit(limit).offset(offset)

    ctx.state.data = studyReport
    
    //查询出所有点赞的人
    for(var i=0; i<studyReport.length; i++){
      var likeUser = await mysql("user_report_like").innerJoin('user_base_info', 'user_base_info.user_id', 'user_report_like.user_id').select('user_base_info.user_id', 'user_base_info.nick_name').where({'user_report_like.report_id':studyReport[i].report_id})
      studyReport[i].nickNameLikeList = likeUser

      for (var j = 0; j < likeUser.length; j++){
        if(userId = likeUser[j].user_id){
          studyReport[i].like = 1
          break
        }
      }  
    }
  }
}