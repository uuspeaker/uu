/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')
const multi_room = require('../multi_room')
const multiRoomPrefix = '/multi_room'

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)
// 新增demo cgi
router.get('/demo',controllers.demo)

//查询所有人的积分详情
router.get('/scoreDetail', controllers.scoreDetail)
//查询所有人的积分排名
router.get('/scoreRank', controllers.scoreRank)
//查询荣誉榜
router.get('/honorRank', controllers.honorRank)
//会议报名
router.get('/meetingApply', controllers.meetingApply.get)
router.post('/meetingApply', controllers.meetingApply.post)
router.put('/meetingApply', controllers.meetingApply.put)
router.delete('/meetingApply', controllers.meetingApply.del)
//会议报名情况
router.get('/meetingApplyInfo', controllers.meetingApplyInfo)
//查询某个人的积分详情
router.get('/userScore', controllers.userScore)
//查询学习力积分详情
router.get('/userStudyRank', controllers.userStudyRank)
//查询汇总数据
router.get('/dataReport', controllers.dataReport)
//当天打卡展示
router.get('/studyShow', controllers.studyShow)
//登记用户积分
router.post('/scoreManage', controllers.scoreManage.post)
//登记用户积分
router.post('/checkin', controllers.checkin.post)
//登记学习时长
router.post('/studyDuration', controllers.studyDuration.post)
router.get('/studyDuration', controllers.studyDuration.get)
//当天打卡展示
router.get('/studyManage', controllers.studyManage)
//学习积分详情
router.get('/studyScore', controllers.studyScore.get)
router.post('/studyScore', controllers.studyScore.post)
//积分补录
router.post('/scoreManage', controllers.scoreManage.post)
//学习积分详情
router.get('/leaderDetail', controllers.leaderDetail.get)
//查询积分榜
router.get('/studyRank', controllers.studyRank)
//查询影响榜
router.get('/leaderRank', controllers.leaderRank)

router.get('/allReport', controllers.allReport.get)

//给复盘点赞
router.post('/likeReport', controllers.likeReport.post)
router.get('/likeReport', controllers.likeReport.get)
router.del('/likeReport', controllers.likeReport.del)
//给复盘评论
router.post('/commentReport', controllers.commentReport.post)
//我的复盘
router.get('/myReport', controllers.myReport.get)
router.post('/myReport', controllers.myReport.post)
router.delete('/myReport', controllers.myReport.del)
//我的即兴房间
router.get('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.get)
router.post('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.post)
router.delete('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.del)
router.put('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.put)
//即兴会议
router.get('/impromptu.impromptuMeeting', controllers.impromptu.impromptuMeeting.get)
router.post('/impromptu.impromptuMeeting', controllers.impromptu.impromptuMeeting.post)
router.delete('/impromptu.impromptuMeeting', controllers.impromptu.impromptuMeeting.del)
//即兴会议发起投票问卷
router.get('/impromptu.impromptuSurvey', controllers.impromptu.impromptuSurvey.get)
router.put('/impromptu.impromptuSurvey', controllers.impromptu.impromptuSurvey.put)
router.post('/impromptu.impromptuSurvey', controllers.impromptu.impromptuSurvey.post)
//即兴会议投票
router.post('/impromptu.impromptuVote', controllers.impromptu.impromptuVote.post)

/**
 * 获取云通信登录所需信息的接口 - 服务器会随机分配用户id 用于后面的进房和出房操作。
 */
router.post(multiRoomPrefix + '/get_im_login_info', multi_room.get_im_login_info)
module.exports = router
