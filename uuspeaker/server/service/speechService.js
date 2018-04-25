const { mysql } = require('../qcloud')
const audioService = require('../service/audioService.js')
const userInfoService = require('../service/userInfoService.js')
const dateUtil = require('../common/dateUtil')
const uuid = require('../common/uuid.js')

//保存演讲题目
var saveSpeechSubject = async (userId, subjectName, speechNames) => {
  await mysql('speech_subject').insert({
    subject_id: uuid.v1(),
    user_id: userId,
    subject_name: subjectName,
    speech_names: speechNames
  })
}

//修改演讲题目
var modifySpeechSubject = async (subjectId, subjectName, speechNames) => {
  await mysql('speech_subject').update({
    subject_name: subjectName,
    speech_names: speechNames
  }).where({subject_id, subjectId})
}

//修改演讲题目
var deleteSpeechSubject = async (subjectId) => {
  await mysql('speech_subject').where({
    subject_id: subjectId
  }).del()
}

//查询所有的演讲题目
var getAllSpeechSubject = async (userId, queryFlag, firstReportTime, lastReportTime) => {
  var limit = 5
  var offset = 0
  //获取用户复盘明细
  var speechSubject = []
  //查询最近10条信息
  if (queryFlag == 0) {
    speechSubject = await mysql("speech_subject").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_subject.user_id').select('speech_subject.*', 'cSessionInfo.user_info').orderBy('speech_subject.create_date', 'desc').limit(limit).offset(offset)
  }
  //查询前10条信息,此种方式会导致10(limit)条之外的数据无法查询到,因影响不大,使用此种简单但不完备的方式
  if (queryFlag == 1) {
    speechSubject = await mysql("speech_subject").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_subject.user_id').select('speech_subject.*', 'cSessionInfo.user_info').orderBy('speech_subject.create_date', 'desc').where('speech_subject.create_date', '>', new Date(firstReportTime)).limit(limit).offset(offset)
  }
  //查询后10条信息
  if (queryFlag == 2) {
    speechSubject = await mysql("speech_subject").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_subject.user_id').select('speech_subject.*', 'cSessionInfo.user_info').orderBy('speech_subject.create_date', 'desc').where('speech_subject.create_date', '<', new Date(lastReportTime)).limit(limit).offset(offset)
  }

  for (var i = 0; i < speechSubject.length; i++) {
    //获取复盘人用户昵称及头像
    speechSubject[i].user_info = userInfoService.getTailoredUserInfo(speechSubject[i].user_info)
    //查询出所有点赞的人，并附到每一条复盘上
    var likeUser = await mysql("user_report_like").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_like.user_id').select('user_report_like.user_id', 'cSessionInfo.user_info').where({ 'user_report_like.report_id': speechSubject[i].subject_id })
    speechSubject[i].nickNameLikeList = likeUser

    //若登陆人有对此条复盘点赞，做个标记
    speechSubject[i].like = 0
    for (var j = 0; j < likeUser.length; j++) {
      //获取点赞人用户昵称及头像
      likeUser[j].user_info = userInfoService.getTailoredUserInfo(likeUser[j].user_info)
      if (userId == likeUser[j].user_id) {
        speechSubject[i].like = 1
        break
      }
    }

    //查询出此条复盘所有的评论，并附到每一条复盘上
    var commentList = await mysql("user_report_comment").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_comment.user_id').select('user_report_comment.user_id', 'cSessionInfo.user_info', 'user_report_comment.comment_id', 'user_report_comment.comment', 'user_report_comment.create_date').where({ 'user_report_comment.report_id': speechSubject[i].subject_id })
    speechSubject[i].commentList = commentList
    //若登陆人有对此条复盘评论，做个标记
    for (var j = 0; j < commentList.length; j++) {
      commentList[j].user_info = userInfoService.getTailoredUserInfo(commentList[j].user_info)
      if (userId == commentList[j].user_id) {
        commentList[j].isMyComment = 1
      } else {
        commentList[j].isMyComment = 0
      }
    }
  }
  return speechSubject
}

//查询所有的演讲题目
var getMySpeechSubject = async (userId, queryFlag, firstReportTime, lastReportTime) => {
  var limit = 5
  var offset = 0
  //获取用户复盘明细
  var speechSubject = []
  //查询最近10条信息
  if (queryFlag == 0) {
    speechSubject = await mysql("speech_subject").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_subject.user_id').select('speech_subject.*', 'cSessionInfo.user_info').orderBy('speech_subject.create_date', 'desc').where({ 'speech_subject.user_id':userId}).limit(limit).offset(offset)
  }
  //查询前10条信息,此种方式会导致10(limit)条之外的数据无法查询到,因影响不大,使用此种简单但不完备的方式
  if (queryFlag == 1) {
    speechSubject = await mysql("speech_subject").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_subject.user_id').select('speech_subject.*', 'cSessionInfo.user_info').orderBy('speech_subject.create_date', 'desc').where({ 'speech_subject.user_id': userId }).andWhere('speech_subject.create_date', '>', new Date(firstReportTime)).limit(limit).offset(offset)
  }
  //查询后10条信息
  if (queryFlag == 2) {
    speechSubject = await mysql("speech_subject").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_subject.user_id').select('speech_subject.*', 'cSessionInfo.user_info').orderBy('speech_subject.create_date', 'desc').where({ 'speech_subject.user_id': userId }).andWhere('speech_subject.create_date', '<', new Date(lastReportTime)).limit(limit).offset(offset)
  }

  for (var i = 0; i < speechSubject.length; i++) {
    //获取复盘人用户昵称及头像
    speechSubject[i].user_info = userInfoService.getTailoredUserInfo(speechSubject[i].user_info)
    //查询出所有点赞的人，并附到每一条复盘上
    var likeUser = await mysql("user_report_like").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_like.user_id').select('user_report_like.user_id', 'cSessionInfo.user_info').where({ 'user_report_like.report_id': speechSubject[i].subject_id })
    speechSubject[i].nickNameLikeList = likeUser

    //若登陆人有对此条复盘点赞，做个标记
    speechSubject[i].like = 0
    for (var j = 0; j < likeUser.length; j++) {
      //获取点赞人用户昵称及头像
      likeUser[j].user_info = userInfoService.getTailoredUserInfo(likeUser[j].user_info)
      if (userId == likeUser[j].user_id) {
        speechSubject[i].like = 1
        break
      }
    }

    //查询出此条复盘所有的评论，并附到每一条复盘上
    var commentList = await mysql("user_report_comment").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_report_comment.user_id').select('user_report_comment.user_id', 'cSessionInfo.user_info', 'user_report_comment.comment_id', 'user_report_comment.comment', 'user_report_comment.create_date').where({ 'user_report_comment.report_id': speechSubject[i].subject_id })
    speechSubject[i].commentList = commentList
    //若登陆人有对此条复盘评论，做个标记
    for (var j = 0; j < commentList.length; j++) {
      commentList[j].user_info = userInfoService.getTailoredUserInfo(commentList[j].user_info)
      if (userId == commentList[j].user_id) {
        commentList[j].isMyComment = 1
      } else {
        commentList[j].isMyComment = 0
      }
    }
  }
  return speechSubject
}

//保存演讲题目
var saveSpeechName = async (userId, speechName) => {
  await mysql('speech_name_info').insert({
    user_id: userId,
    speech_name: speechName
  })
}

//修改演讲题目
var deleteSpeechName = async (speechName) => {
  await mysql('speech_name_info').where({
    speech_name: speechName
  }).del()
}

//保存演讲题目
var querySpeechByName = async (speechName) => {
  var data = await mysql('speech_name_info').where({ speech_name: speechName})
  return data
}

//查询我的演讲题目
var getMySpeechNameList = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  //获取用户复盘明细
  var speechNameList = []
  //查询最近10条信息
  if (queryPageType == 0) {
    speechNameList = await mysql("speech_name_info").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_name_info.user_id').select('speech_name_info.*', 'cSessionInfo.user_info').orderBy('speech_name_info.create_date', 'desc').where({ 'speech_name_info.user_id': userId }).limit(limit).offset(offset)
  }
  //查询前10条信息,此种方式会导致10(limit)条之外的数据无法查询到,因影响不大,使用此种简单但不完备的方式
  if (queryPageType == 1) {
    speechNameList = await mysql("speech_name_info").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_name_info.user_id').select('speech_name_info.*', 'cSessionInfo.user_info').orderBy('speech_name_info.create_date', 'desc').where({ 'speech_name_info.user_id': userId }).andWhere('speech_name_info.create_date', '>', new Date(firstDataTime)).limit(limit).offset(offset)
  }
  //查询后10条信息
  if (queryPageType == 2) {
    speechNameList = await mysql("speech_name_info").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_name_info.user_id').select('speech_name_info.*', 'cSessionInfo.user_info').orderBy('speech_name_info.create_date', 'desc').where({ 'speech_name_info.user_id': userId }).andWhere('speech_name_info.create_date', '<', new Date(lastDataTime)).limit(limit).offset(offset)
  }
  for (var j = 0; j < speechNameList.length; j++) {
    speechNameList[j].user_info = userInfoService.getTailoredUserInfo(speechNameList[j].user_info)
  }
  return speechNameList
}
//查询全部演讲题目
var getAllSpeechNameList = async ( queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var speechNameList = []
  //查询最近10条信息
  if (queryPageType == 0) {
    speechNameList = await mysql("speech_name_info").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_name_info.user_id').select('speech_name_info.*', 'cSessionInfo.user_info').orderBy('speech_name_info.create_date', 'desc').limit(limit).offset(offset)
  }
  //查询前10条信息,
  if (queryPageType == 1) {
    speechNameList = await mysql("speech_name_info").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_name_info.user_id').select('speech_name_info.*', 'cSessionInfo.user_info').orderBy('speech_name_info.create_date', 'desc').where('speech_name_info.create_date', '>', new Date(firstDataTime)).limit(limit).offset(offset)
  }
  //查询后10条信息
  if (queryPageType == 2) {
    speechNameList = await mysql("speech_name_info").innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'speech_name_info.user_id').select('speech_name_info.*', 'cSessionInfo.user_info').orderBy('speech_name_info.create_date', 'desc').where('speech_name_info.create_date', '<', new Date(lastDataTime)).limit(limit).offset(offset)
  }
  for (var j = 0; j < speechNameList.length; j++) {
    speechNameList[j].user_info = userInfoService.getTailoredUserInfo(speechNameList[j].user_info)
  }
  return speechNameList
}
//查询我的未点评的演讲题目
var getUnevaluatedSpeechNames = async (userId) => {
  var limit = 10
  var offset = 0
  var speechNameList = speechNameList = await mysql("speech_name_info").whereNotExists(mysql("speech_name_evaluate").whereRaw('speech_name_info.speech_name = speech_name_evaluate.speech_name').andWhere({'speech_name_evaluate.user_id':userId})).limit(limit).offset(offset)
  return speechNameList
}

var evaluateSpeechName = async (userId,speechName,level) => {
  await mysql("speech_name_evaluate").where({
    speech_name: speechName,
    user_id: userId
  }).del()
  await mysql("speech_name_evaluate").insert({
    speech_name: speechName,
    user_id: userId,
    level: level
  })

  calculateAverageLevel(speechName)
}

var calculateAverageLevel = async (speechName) => {
  var averageLevel = await mysql("speech_name_evaluate").avg('level as level').where({
    speech_name: speechName
  })
  var level = Math.floor(averageLevel[0].level + 0.5)
  await mysql("speech_name_info").update({
    level: level
  }).where({
    speech_name: speechName
  })
}

var getRandomSpeechName = async (createDate) => {
  var limit = 10
  var offset = 0
  if (createDate == ''){
    createDate = new Date()
  }else{
    createDate = new Date(createDate)
  }
  var speechNames = await mysql("speech_name_info").where('create_date', '<', createDate).orderBy('create_date','desc').limit(limit).offset(offset)
  if (speechNames.length == 0){
    speechNames = await mysql("speech_name_info").where('create_date', '<', new Date()).orderBy('create_date', 'desc').limit(limit).offset(offset)
  } 
  if (speechNames.length == 0)return[]
  var index = Math.floor(Math.random() * 10)
  if (speechNames.length <= index){
    index = speechNames.length - 1
  }
  return speechNames[index]
}

module.exports = { 
  saveSpeechSubject, 
  deleteSpeechSubject, 
  getMySpeechSubject, 
  getAllSpeechSubject,
  saveSpeechName,
  deleteSpeechName,
  querySpeechByName,
  getMySpeechNameList, 
  getAllSpeechNameList,
  getUnevaluatedSpeechNames,
  evaluateSpeechName,
  getRandomSpeechName,
   }