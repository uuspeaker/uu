const { mysql } = require('../../qcloud')
const config = require('../../config')

module.exports = {

  get: async ctx => {
    //var data = await mysql('user_control')
    ctx.state.data = config.userControl
  },

}