const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const dateUtil = require('../../common/dateUtil')
const uuid = require('../../common/uuid');
var impromptuRoomService = require('../../service/impromptuRoomService');

module.exports = {
  post: async ctx => {
    var roomId = ctx.request.body.roomId
    var meetingUserStr = ctx.request.body.meetingUser
    //var meetingUser = JSON.parse(meetingUserStr)
    await mysql('impromptu_survey').where({room_id: roomId,}).del()
    await mysql('impromptu_survey').insert(
      {
        room_id: roomId,
        meeting_user: meetingUserStr
      })
    await mysql('room_impromptu').update(
      {
        survey_status: 2
      }).where({ room_id: roomId, })
  },

  put: async ctx => {
    var roomId = ctx.request.body.roomId
    //var meetingDate = await mysql("room_impromptu").select('start_date').where({ room_id: roomId})
    //var meetingDateStr = meetingDate[0].start_date.replace(/-/g,'')
    var meetingDateStr = dateUtil.getToday()
    var bestSpeaker = await mysql("impromptu_vote").select('best_speaker', mysql.raw("count(best_speaker) as total_score")).where({ room_id: roomId}).groupBy('best_speaker').orderBy('total_score', 'desc')
    var bestEvaluator = await mysql("impromptu_vote").select('best_evaluator', mysql.raw("count(best_evaluator) as total_score")).where({ room_id: roomId}).groupBy('best_evaluator').orderBy('total_score', 'desc')

    //更新最佳演讲者信息
    await mysql('user_score_detail').insert(
      {
        room_id: roomId,
        user_id: bestSpeaker[0].best_speaker,
        meeting_date: meetingDateStr,
        score_type: 2
      })
    //更新最佳点评人信息
    await mysql('user_score_detail').insert(
      {
        room_id: roomId,
        user_id: bestEvaluator[0].best_evaluator,
        meeting_date: meetingDateStr,
        score_type: 3
      })

    //更新参会人员信息
    var meetingUserStr = await mysql('impromptu_survey').select('meeting_user').where({ room_id: roomId, })
    var hostUserInfo = await mysql('meeting_apply').select('user_id').where({ room_id: roomId, role_type:2})
    var meetingUser = JSON.parse(meetingUserStr[0].meeting_user)
    for (var i = 0; i < meetingUser.length; i++) {
      if (meetingUser[i].checked == true){
        //更新参会人员信息
        await mysql('user_score_detail').insert(
          {
            room_id: roomId,
            user_id: meetingUser[i].value,
            meeting_date: meetingDateStr,
            score_type: 1
          })
          //更新主持人信息
        for (var j = 0; j < hostUserInfo.length; j++){
          //若参会人员有报名主持
          if (hostUserInfo[j].user_id == meetingUser[i].value){
            await mysql('user_score_detail').insert(
              {
                room_id: roomId,
                user_id: meetingUser[i].value,
                meeting_date: meetingDateStr,
                score_type: 4
              })
          }
        }
      }else{
        //更新缺勤人员信息
        await mysql('user_absent').insert(
          {
            room_id: roomId,
            user_id: meetingUser[i].value,
            meeting_date: meetingDateStr
          })
      }
      
    }
    //更新会议投票状态为已完成
    await mysql('room_impromptu').update({survey_status: 3}).where({room_id: roomId})
    
  },

  get: async ctx => {
    var roomId =  ctx.query.roomId
    var meetingUserStr = await mysql('impromptu_survey').select('meeting_user').where({ room_id: roomId, })
    var bestSpeaker = await mysql("impromptu_vote").select('best_speaker', mysql.raw("count(best_speaker) as total_score")).where({ room_id: roomId, }).groupBy('best_speaker')
    var bestEvaluator = await mysql("impromptu_vote").select('best_evaluator', mysql.raw("count(best_evaluator) as total_score")).where({ room_id: roomId, }).groupBy('best_evaluator')
    //将参会用户信息转化成json格式并剔除未参会用户
    var meetingUserTmp = JSON.parse(meetingUserStr[0].meeting_user)
    var meetingUser = []
    for (var i = 0; i < meetingUserTmp.length; i++) {
      if (meetingUserTmp[i].checked == true) {
        meetingUserTmp[i].checked = false
        //补充参会者演讲被投票次数
        meetingUserTmp[i].speakerScore = 0
        for (var j= 0; j < bestSpeaker.length; j++){ 
          if (bestSpeaker[j].best_speaker == meetingUserTmp[i].value){
            meetingUserTmp[i].speakerScore = bestSpeaker[j].total_score
          }
        }
        //补充参会者点评被投票次数
        meetingUserTmp[i].evaluatorScore = 0
        for (var j = 0; j < bestEvaluator.length; j++) {
          if (bestEvaluator[j].best_evaluator == meetingUserTmp[i].value) {
            meetingUserTmp[i].evaluatorScore = bestEvaluator[j].total_score
          }
        }
        meetingUser.push(meetingUserTmp[i])
      }
    }

    ctx.state.data = meetingUser
  },

}