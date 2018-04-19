/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')
const multi_room = require('../multi_room')
const account = require('../account')
const utils = require('../utils')
const multiRoomPrefix = '/multi_room'
const utilsPrefix = '/utils'

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

//查询所有人的积分详情
router.get('/scoreDetail', controllers.score.scoreDetail)
//查询所有人的积分排名
router.get('/scoreRank', controllers.score.scoreRank)
//查询荣誉榜
router.get('/honorRank', controllers.honorRank)
//会议报名
router.get('/meetingApply', controllers.meeting.meetingApply.get)
router.post('/meetingApply', controllers.meeting.meetingApply.post)
router.put('/meetingApply', controllers.meeting.meetingApply.put)
router.delete('/meetingApply', controllers.meeting.meetingApply.del)
//会议报名情况
router.get('/meetingApplyInfo', controllers.meeting.meetingApplyInfo)
//查询某个人的积分详情
router.get('/userScore', controllers.score.userScore)
//查询学习力积分详情
router.get('/userStudyRank', controllers.study.userStudyRank)
//查询汇总数据
router.get('/dataReport', controllers.dataReport)
//当天打卡展示
router.get('/studyShow', controllers.study.studyShow)
//登记用户积分
router.post('/scoreManage', controllers.score.scoreManage.post)
//登记用户积分
router.post('/checkin', controllers.checkin.post)
//登记学习时长
router.post('/studyDuration', controllers.study.studyDuration.post)
router.get('/studyDuration', controllers.study.studyDuration.get)
//查询学习时长
router.get('/userInfo.studyDuration', controllers.userInfo.studyDuration.get)
//当天打卡展示
router.get('/studyManage', controllers.study.studyManage)
//学习积分详情
router.get('/studyScore', controllers.study.studyScore.get)
router.post('/studyScore', controllers.study.studyScore.post)
//积分补录
router.post('/scoreManage', controllers.score.scoreManage.post)
//学习积分详情
router.get('/leaderDetail', controllers.leaderDetail.get)
//查询积分榜
router.get('/studyRank', controllers.study.studyRank)
//查询影响榜
router.get('/leaderRank', controllers.leaderRank)

router.get('/article.allArticle', controllers.article.allArticle.get)

//给复盘点赞
router.post('/article.likeArticle', controllers.article.likeArticle.post)
router.get('/article.likeArticle', controllers.article.likeArticle.get)
router.del('/article.likeArticle', controllers.article.likeArticle.del)
//给复盘评论
router.post('/article.commentArticle', controllers.article.commentArticle.post)
//我的复盘
router.get('/article.myArticle', controllers.article.myArticle.get)
router.post('/article.myArticle', controllers.article.myArticle.post)
router.delete('/article.myArticle', controllers.article.myArticle.del)
//所有即兴房间
router.get('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.get)
router.post('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.post)
router.delete('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.del)
router.put('/impromptu.impromptuRoom', controllers.impromptu.impromptuRoom.put)
//我的即兴房间
router.get('/impromptu.myImpromptuRoom', controllers.impromptu.myImpromptuRoom.get)
router.post('/impromptu.myImpromptuRoom', controllers.impromptu.myImpromptuRoom.post)
router.delete('/impromptu.myImpromptuRoom', controllers.impromptu.myImpromptuRoom.del)
router.put('/impromptu.myImpromptuRoom', controllers.impromptu.myImpromptuRoom.put)
//即兴会议
router.get('/impromptu.impromptuMeeting', controllers.impromptu.impromptuMeeting.get)
router.post('/impromptu.impromptuMeeting', controllers.impromptu.impromptuMeeting.post)
router.delete('/impromptu.impromptuMeeting', controllers.impromptu.impromptuMeeting.del)
//即兴会议音频上传
router.post('/impromptu.impromptuAudio', controllers.impromptu.impromptuAudio.post)
//即兴会议音频点赞
router.post('/impromptu.likeAudio', controllers.impromptu.likeAudio.post)
router.get('/impromptu.likeAudio', controllers.impromptu.likeAudio.get)
//音频点赞
router.post('/audio.audioLike', controllers.audio.audioLike.post)
router.delete('/audio.audioLike', controllers.audio.audioLike.del)
router.get('/audio.audioLike', controllers.audio.audioLike.get)
//音频察看
router.post('/audio.audioView', controllers.audio.audioView.post)
//即兴会议音频更新状态
router.put('/impromptu.updateAudio', controllers.impromptu.updateAudio.put)
//即兴会议音频详情
router.get('/impromptu.audioDetail', controllers.impromptu.audioDetail.get)

//即兴会议音频管理
router.get('/impromptu.userAudio', controllers.impromptu.userAudio.get)
router.post('/impromptu.userAudio', controllers.impromptu.userAudio.post)
//router.put('/impromptu.userAudio', controllers.impromptu.userAudio.put)
router.delete('/impromptu.userAudio', controllers.impromptu.userAudio.del)

//即兴会议音频管理
router.get('/impromptu.myAudio', controllers.impromptu.myAudio.get)
router.post('/impromptu.myAudio', controllers.impromptu.myAudio.post)
router.put('/impromptu.myAudio', controllers.impromptu.myAudio.put)
router.delete('/impromptu.myAudio', controllers.impromptu.myAudio.del)
//音频评论管理
router.get('/audio.audioComment', controllers.audio.audioComment.get)
router.post('/audio.audioComment', controllers.audio.audioComment.post)
//任务首页查询
router.get('/task.taskIndex', controllers.task.taskIndex.get)
//30秒任务查询
router.get('/task.dailyTaskToDo', controllers.task.dailyTaskToDo.get)
//日常任务管理
router.get('/task.dailyTask', controllers.task.dailyTask.get)
router.post('/task.dailyTask', controllers.task.dailyTask.post)
router.put('/task.dailyTask', controllers.task.dailyTask.put)
//个人自定义任务管理
router.get('/task.specialTask', controllers.task.specialTask.get)
router.post('/task.specialTask', controllers.task.specialTask.post)
//所有自定义任务管理
router.get('/task.allSpecialTask', controllers.task.allSpecialTask.get)
//个人介绍管理
router.get('/task.userIntroduction', controllers.task.userIntroduction.get)
router.post('/task.userIntroduction', controllers.task.userIntroduction.post)
//用户关注管理
router.get('/userInfo.likeUser', controllers.userInfo.likeUser.get)
router.post('/userInfo.likeUser', controllers.userInfo.likeUser.post)
router.delete('/userInfo.likeUser', controllers.userInfo.likeUser.del)
//用户关注管理
router.get('/userInfo.likeUserTotal', controllers.userInfo.likeUserTotal.get)
router.get('/userInfo.likeUserList', controllers.userInfo.likeUserList.get)
//用户基础信息管理
router.get('/userInfo.userBaseInfo', controllers.userInfo.userBaseInfo.get)
//查询用户影响力信息
router.get('/userInfo.myInfluenceList', controllers.userInfo.myInfluenceList.get)

//即兴会议发起投票问卷
router.get('/impromptu.impromptuSurvey', controllers.impromptu.impromptuSurvey.get)
router.put('/impromptu.impromptuSurvey', controllers.impromptu.impromptuSurvey.put)
router.post('/impromptu.impromptuSurvey', controllers.impromptu.impromptuSurvey.post)
//即兴会议投票
router.post('/impromptu.impromptuVote', controllers.impromptu.impromptuVote.post)
//即兴会议用户对话
router.post('/impromptu.impromptuDialog', controllers.impromptu.impromptuDialog.post)
router.get('/impromptu.impromptuDialog', controllers.impromptu.impromptuDialog.get)
//用户目标管理
router.get('/target.myTarget', controllers.target.myTarget.get)
router.put('/target.myTarget', controllers.target.myTarget.put)
router.post('/target.myTarget', controllers.target.myTarget.post)
//所有用户目标查询
router.get('/target.allTarget', controllers.target.allTarget.get)
//演讲题目管理
router.get('/speech.allSpeechSubject', controllers.speech.allSpeechSubject.get)
//演讲题目管理
router.get('/speech.mySpeechSubject', controllers.speech.mySpeechSubject.get)
router.post('/speech.mySpeechSubject', controllers.speech.mySpeechSubject.post)
router.delete('/speech.mySpeechSubject', controllers.speech.mySpeechSubject.del)



//------------------------------------ 多人房间接口 ---------------------------------------------------
//获取云通信登录所需信息的接口 - 针对接口给定的userId派发 IM 的userSig。
router.post(multiRoomPrefix + '/login', account.login)
//登出接口什么也没做
router.post(multiRoomPrefix + '/logout', account.logout)
//获取云通信登录所需信息的接口 - 服务器会随机分配用户id 用于后面的进房和出房操作。
router.post(multiRoomPrefix + '/get_im_login_info', multi_room.get_im_login_info)
//获取推流地址
router.post(multiRoomPrefix + '/get_push_url', multi_room.get_push_url)
//多人 - 获取房间列表接口 -
router.post(multiRoomPrefix + '/get_room_list', multi_room.get_room_list)
//多人 - 获取房间成员列表接口 -
router.post(multiRoomPrefix + '/get_pushers', multi_room.get_pushers)
//多人 - 创建房间接口 - 
router.post(multiRoomPrefix + '/create_room', multi_room.create_room)
//多人 - 销毁房间接口 - 
router.post(multiRoomPrefix + '/destroy_room', multi_room.destroy_room)
//多人 - 进入房间接口 - 客户端配合云通信的 群组消息 通知房间其他成员，您进入房间。
router.post(multiRoomPrefix + '/add_pusher', multi_room.add_pusher)
//多人 - 离开房间接口 - 客户端配合云通信的 群组消息 通知房间其他成员，您离开房间。
router.post(multiRoomPrefix + '/delete_pusher', multi_room.delete_pusher)
//多人 - 房间成员心跳接口 - 客户端需要定时调用这个接口维持和server的心跳。
router.post(multiRoomPrefix + '/pusher_heartbeat', multi_room.pusher_heartbeat)
//房间是否存在
router.post('/multi_room.isRoomExist', multi_room.isRoomExist)

//------------------------------------- 提取log辅助函数 --------------------------------------------------
//辅助接口 - 用于获取业务后台的日志文件列表。
router.get(utilsPrefix + '/logfilelist', utils.logfilelist);
// 辅助接口 - 用户获取业务后台的指定日志文件。
router.get(utilsPrefix + '/getlogfile', utils.getlogfile);
// 辅助接口 - 用于检查config.js 相关配置是否正确。
router.get(utilsPrefix + '/check_config', utils.test_config)

// -------------------------------------- 直播demo辅助接口 -------------------------------------------------
//直播接口 - 获取推流地址
router.get(utilsPrefix + '/get_test_pushurl', utils.get_test_pushurl)
// 直播接口 - 获取播放地址
router.get(utilsPrefix + '/get_test_rtmpaccurl', utils.get_test_rtmpaccurl)
router.post(utilsPrefix + '/get_login_info', utils.get_login_info)

// 语音识别
router.post('/recognize', controllers.recognize)

module.exports = router
