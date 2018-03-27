const { mysql } = require('../qcloud')
const audioService = require('../service/audioService.js')
/**
 * 完成演讲任务 
 * 返回：
 */
var saveTask = async (audioId, taskType, userId, timeDuration) => {
  await mysql('user_task').insert({
    task_id: audioId,
    user_id: userId,
    task_type: taskType,
    task_status: 2
  })

  await audioService.saveAudio(audioId, userId, timeDuration)
}

module.exports = { saveTask}