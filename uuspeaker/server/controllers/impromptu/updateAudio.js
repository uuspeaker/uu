const { mysql } = require('../../qcloud')
const userInfo = require('../../common/userInfo')
const uuid = require('../../common/uuid');
const config = require('../../config')
const audioService = require('../../service/audioService')

module.exports = {
  put: async ctx => {
    var audioId = ctx.request.body.audioId
    var timeDuration = ctx.request.body.timeDuration
    audioService.completeSpeechAudio(audioId, timeDuration)
  },

  
  

}