const { mysql } = require('../qcloud')

module.exports = {
  post: async ctx => {
    var userId = ctx.request.body.userId
    var meetingDate = ctx.request.body.meetingDate
    var meetingTime = ctx.request.body.meetingTime
    var isJoinMeeting = ctx.request.body.isJoinMeeting
    var isSpeaker = ctx.request.body.isSpeaker
    var isEvaluator = ctx.request.body.isEvaluator
    var isHost = ctx.request.body.isHost
    var isReport = ctx.request.body.isReport

    //删除原有记录
    await mysql('user_score_detail').where({
      user_id: userId,
      meeting_date: meetingDate,
      meeting_time: meetingTime
    }).del()
    
    //更新参会记录
    if (isJoinMeeting == true) {
      await mysql('user_score_detail').insert(
        {
          user_id: userId,
          meeting_Date: meetingDate,
          meeting_time: meetingTime,
          score_type: 1
        })
    }

    //更新演讲获奖
    if (isSpeaker == true) {
      await mysql('user_score_detail').insert(
        {
          user_id: userId,
          meeting_Date: meetingDate,
          meeting_time: meetingTime,
          score_type: 2
        })
    }

    //更新点评获奖
    if (isEvaluator == true) {
      await mysql('user_score_detail').insert(
        {
          user_id: userId,
          meeting_Date: meetingDate,
          meeting_time: meetingTime,
          score_type: 3
        })
    }

    //更新主持记录
    if (isHost == true) {
      await mysql('user_score_detail').insert(
        {
          user_id: userId,
          meeting_Date: meetingDate,
          meeting_time: meetingTime,
          score_type: 4
        })
    }

    //更新复盘记录
    if (isReport == true) {
      await mysql('user_score_detail').insert(
        {
          user_id: userId,
          meeting_Date: meetingDate,
          meeting_time: meetingTime,
          score_type: 5
        })
    }
  }
}