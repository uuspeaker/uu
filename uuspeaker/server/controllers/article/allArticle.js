const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo.js')
const articleService = require('../../service/articleService.js')

module.exports = {

  get: async ctx => {
    var userId = await userInfo.getOpenId(ctx)
    //1我的 2我关注的 3最新的
    var queryUserType = ctx.query.queryUserType
    var queryPageType = ctx.query.queryPageType
    var firstReportTime = ctx.query.firstReportTime
    var lastReportTime = ctx.query.lastReportTime
    //获取用户复盘明细
    var articleData = []
    if (queryUserType == 1){
      articleData = await articleService.getAllArticle(userId, queryPageType, firstReportTime, lastReportTime)
    }
    if (queryUserType == 2) {
      articleData = await articleService.getArticleOfLikeUser(userId, queryPageType, firstReportTime, lastReportTime)
    }
    if (queryUserType == 3) {
      articleData = await articleService.getMyArticle(userId, queryPageType, firstReportTime, lastReportTime)
    }
    
    ctx.state.data = articleData
  }
}