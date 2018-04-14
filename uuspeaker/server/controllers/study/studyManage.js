const userInfoService = require('../../service/userInfoService')

module.exports = async ctx => {
  //查询用户ID
  var userId = await userInfoService.getOpenId(ctx)
  ctx.state.data = {
    totalScore: await userInfoService.getTotalScore(userId),
    meetingScore: await userInfoService.getMeetingScore(userId),
    speakerScore: await userInfoService.getSpeakerScore(userId),
    evaluatorScore: await userInfoService.getEvaluatorScore(userId),
    hostScore: await userInfoService.getHostScore(userId),
    reportScore: await userInfoService.getReportScore(userId)
  }

}