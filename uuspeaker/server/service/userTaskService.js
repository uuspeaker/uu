const { mysql } = require('../qcloud')
const audioService = require('../service/audioService.js')
const dateUtil = require('../common/dateUtil')
/**
 * 完成演讲任务 
 * 返回：
 */
var saveTask = async (taskId, taskType, userId, timeDuration) => {
  await mysql('user_task').insert({
    task_id: taskId,
    user_id: userId,
    task_type: taskType,
    task_status: 2
  })

  await audioService.saveAudio(taskId, userId, timeDuration)
}

/**
 * 完成演讲任务 
 * 返回：
 */
var getTodayTask = async (userId,taskType) => {
  var taskDate = new Date()
  taskDate.setHours(0)
  taskDate.setMinutes(0)
  taskDate.setSeconds(0)
  var taskData
  if (taskType == 0){
    taskData = await mysql('user_task').select('user_task.task_type','impromptu_audio.*').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'user_task.task_id').where(
      'user_task.user_id', userId
    ).andWhere('user_task.create_date', '>', taskDate)
  }else{
    taskData = await mysql('user_task').select('user_task.task_type', 'impromptu_audio.*').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'user_task.task_id').where(
      'user_task.user_id', userId
    ).andWhere({ task_type: taskType }).andWhere('user_task.create_date', '>', taskDate)   
  }
  for (var i = 0; i < taskData.length; i++) {
    taskData[i].src = audioService.getSrc(taskData[i].audio_id)
  }
  return taskData
}

//删除用户任务
var deleteTask = async (taskId) => {
  await mysql('user_task').where({
    task_id: taskId
  }).del()
}


module.exports = { saveTask, getTodayTask, deleteTask}