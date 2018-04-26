const { mysql } = require('../qcloud')
const audioService = require('../service/audioService.js')
const userInfoService = require('../service/userInfoService.js')
const dateUtil = require('../common/dateUtil.js')
/**
 * 完成演讲任务 
 * 返回：
 */
var saveDailyTask = async (taskId, taskType, userId, timeDuration) => {

  // await mysql('user_daily_task').where({
  //   user_id: userId
  // }).del()

  await mysql('user_daily_task').insert({
    task_id: taskId,
    user_id: userId,
    task_type: taskType,
    task_status: 2
  })

  await audioService.saveAudio(taskId, '', '',userId, timeDuration)
}

/**
 * 查询我当天的任务 
 * 返回：
 */
var getAllMyTodayTask = async (userId) => {
  var taskDate = new Date()
  taskDate.setHours(0)
  taskDate.setMinutes(0)
  taskDate.setSeconds(0)

  var taskData = await mysql('user_daily_task').select('user_daily_task.task_type', 'impromptu_audio.*').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'user_daily_task.task_id').where(
    'user_daily_task.user_id', userId
  ).andWhere('user_daily_task.create_date', '>', taskDate)

  return taskData
}

/**
 * 查询我所有的任务 
 * 返回：
 */
var getMyTodayTaskByType = async (userId, taskType) => {
  var limit = 30
  var offset = 0
  var taskDate = new Date()
  taskDate.setHours(0)
  taskDate.setMinutes(0)
  taskDate.setSeconds(0)

  var taskData = await mysql('user_daily_task').select('user_daily_task.task_type', 'cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'user_daily_task.task_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_daily_task.user_id').where(
    'user_daily_task.user_id', userId
  ).andWhere({ task_type: taskType }).orderBy('create_date', 'desc').limit(limit).offset(offset)

  for (var i = 0; i < taskData.length; i++) {
    taskData[i].src = audioService.getSrc(taskData[i].audio_id)
    taskData[i].user_info = userInfoService.getTailoredUserInfo(taskData[i].user_info)
  }
  return taskData
}

/**
 * 查询我所有的任务 
 * 返回：
 */
var getUserTask = async (taskType) => {
  var limit = 20
  var offset = 0
  var taskDate = new Date()
  taskDate.setHours(0)
  taskDate.setMinutes(0)
  taskDate.setSeconds(0)

  var taskData = await mysql('user_daily_task').select('user_daily_task.task_type', 'cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'user_daily_task.task_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'user_daily_task.user_id').where({ task_type: taskType }).andWhere('user_daily_task.create_date', '>', taskDate).orderBy('impromptu_audio.like_amount', 'desc').limit(limit).offset(offset)

  for (var i = 0; i < taskData.length; i++) {
    taskData[i].src = audioService.getSrc(taskData[i].audio_id)
    taskData[i].user_info = userInfoService.getTailoredUserInfo(taskData[i].user_info)
  }
  return taskData
}

//删除用户任务
var deleteTask = async (taskId) => {
  await mysql('user_daily_task').where({
    task_id: taskId
  }).del()
}

//点评任务
var evaluateTask = async (taskAudioId, evaluationAudioId, userId, timeDuration) => {
  audioService.evaluateAudio('', evaluationAudioId, '', userId, timeDuration, taskAudioId)
}

/**
 * 保存用户自定义任务任
 * 返回：
 */
var saveSpecialTask = async (taskId, taskName, taskText, userId, timeDuration) => {
  // await mysql('user_special_task').insert({
  //   task_id: taskId,
  //   user_id: userId
  // })

  await audioService.saveAudio(taskId, taskName, taskText,userId, timeDuration)
}

/**
 * 查询我所有的自定义任务 
 * 返回：
 */
var getMySpecialTask = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var taskData = []

  if (queryPageType == 0) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where({ 'impromptu_audio.user_id': userId ,audio_type:1}).orderBy('impromptu_audio.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where({ 'impromptu_audio.user_id': userId, audio_type: 1 }).andWhere('impromptu_audio.create_date', '>', new Date(firstDataTime)).orderBy('impromptu_audio.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where({ 'impromptu_audio.user_id': userId, audio_type: 1 }).andWhere('impromptu_audio.create_date', '<', new Date(lastDataTime)).orderBy('impromptu_audio.create_date', 'desc').limit(limit).offset(offset)
  }


  for (var i = 0; i < taskData.length; i++) {
    taskData[i].src = audioService.getSrc(taskData[i].audio_id)
    taskData[i].user_info = userInfoService.getTailoredUserInfo(taskData[i].user_info)
  }
  return taskData
}

/**
 * 查询所有的自定义任务 
 * 返回：
 */
var getAllSpecialTask = async (queryUserType, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var taskData = []

  if (queryPageType == 0) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where({ audio_type: 1 }).andWhere('time_duration','>=',60).orderBy('impromptu_audio.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where('impromptu_audio.create_date', '>', new Date(firstDataTime)).andWhere({ audio_type: 1 }).andWhere('time_duration', '>=', 60).orderBy('impromptu_audio.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where('impromptu_audio.create_date', '<', new Date(lastDataTime)).andWhere({ audio_type: 1 }).andWhere('time_duration', '>=', 60).orderBy('impromptu_audio.create_date', 'desc').limit(limit).offset(offset)
  }

  for (var i = 0; i < taskData.length; i++) {
    taskData[i].src = audioService.getSrc(taskData[i].audio_id)
    taskData[i].user_info = userInfoService.getTailoredUserInfo(taskData[i].user_info)
  }
  return taskData
}

/**
 * 查询所关注用户的自定义任务 
 * 返回：
 */
var getTaskOfLikeUser = async (userId,queryUserType, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var orderBy = 'impromptu_audio.create_date'
  if (queryUserType == 3) {
    orderBy = 'impromptu_audio.like_amount'
  }
  var taskData = []

  if (queryPageType == 0) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').innerJoin('user_like', 'user_like.like_user_id', 'impromptu_audio.user_id').where({ 'user_like.user_id': userId, audio_type: 1 }).andWhere('time_duration', '>=', 60).orderBy(orderBy, 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').innerJoin('user_like', 'user_like.like_user_id', 'impromptu_audio.user_id').where({ 'user_like.user_id': userId, audio_type: 1 }).andWhere('impromptu_audio.create_date', '>', new Date(firstDataTime)).andWhere('time_duration', '>=', 60).orderBy(orderBy, 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    taskData = await mysql('impromptu_audio').select('cSessionInfo.user_info', 'impromptu_audio.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').innerJoin('user_like', 'user_like.like_user_id', 'impromptu_audio.user_id').where({ 'user_like.user_id': userId, audio_type: 1}).andWhere('impromptu_audio.create_date', '<', new Date(lastDataTime)).orderBy(orderBy, 'desc').limit(limit).offset(offset)
  }

  for (var i = 0; i < taskData.length; i++) {
    taskData[i].src = audioService.getSrc(taskData[i].audio_id)
    taskData[i].user_info = userInfoService.getTailoredUserInfo(taskData[i].user_info)
  }
  return taskData
}

//查询热门任务
var getHotTask = async () => {
  var limit = 10
  var offset = 0

  var taskData = await mysql('impromptu_audio').select('audio_name', mysql.raw("count(1) as totalAmount")).groupBy('audio_name').orderBy('totalAmount', 'desc').limit(limit).offset(offset)

  return taskData
}



module.exports = { 
  saveDailyTask, 
  getAllMyTodayTask, 
  getMyTodayTaskByType, 
  getUserTask, deleteTask, 
  evaluateTask, 
  saveSpecialTask, 
  getMySpecialTask, 
  getAllSpecialTask, 
  getTaskOfLikeUser, 
  getHotTask
  }