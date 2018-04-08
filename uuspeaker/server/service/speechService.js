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

//查询我的演讲题目
var getMySpeechSubject = async (userId) => {
  await mysql('speech_subject').where({
    user_id: userId
  })
}

//查询所有的演讲题目
var getAllSpeechSubject = async (userId) => {
  var limit = 20
  var offset = 0
  await mysql('speech_subject').where({
    user_id: userId
  }).orderBy('like_amount','desc').limit(limit).offset(offset)
}

module.exports = { saveSpeechSubject, modifySpeechSubject, getMySpeechSubject, getAllSpeechSubject }