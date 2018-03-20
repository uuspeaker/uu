const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const config = require('../../config')

module.exports = {
  put: async ctx => {
    var audioId = ctx.request.body.audioId
    var timeDuration = ctx.request.body.timeDuration
    await mysql('impromptu_audio').update(
      {
        time_duration: timeDuration,
        audio_status: 2
      }).where({
        audio_id: audioId
      })
  },

  
  

}