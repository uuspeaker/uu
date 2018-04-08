const { mysql } = require('../../qcloud')
const userTaskService = require('../../service/userTaskService')

module.exports = {

  get: async ctx => {
    var taskData = await userTaskService.getAllSpecialTask()
    ctx.state.data = taskData
  },

}