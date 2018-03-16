const { mysql } = require('../../qcloud')
const uploadAudio = require('../../upload/uploadAudio.js')
const audioToText = require('../../upload/audioToText.js')
const uuid = require('../../common/uuid.js')
const userInfo = require('../../common/userInfo')
const multiparty = require('multiparty')
const config = require('../../config')
const fs = require('fs')

module.exports = {

  post: async ctx => {
    const { fields, files } = await resolveUploadFileFromRequest(ctx.req)
    var file = files.file[0]
    try {
      //保存音频文件
      uploadAudio.upload(fields, files)
      //将音频转化成文字
      var audioArr = await audioToText(files)
      ctx.state.data = audioArr
      //将音频及文字保存到数据库
      // var userId = fields.userId[0]
      // var audioId = fields.audioId[0]
      // var roomId = fields.roomId[0]
      // var audioName = fields.audioName[0]
      // var timeDuration = fields.timeDuration[0]

      // var audioText = await voice.getAudioText(audioTextArr)
      // console.log('audioText', audioText)
      // for (var i = 0; i < audioTextArr.length; i++) {
      //   audioText = audioText + audioTextArr[i].text
      // }
      // console.log('audioText', audioText)
    //   if (audioText == undefined){
    //     audioText = ''
    //   } 
    //   var data = mysql('impromptu_audio').insert({
    //     audio_id: audioId,
    //     audio_name: audioName,
    //     user_id: userId,
    //     room_id: roomId,
    //     audio_text: audioText,
    //     time_duration: timeDuration
    //   })
    //   ctx.state.data = audioText
    } catch (e) {
      console.log('imromptuAudio fail', e)
    } finally {
      if (files.file[0]) {
        fs.unlink(files.file[0].path, (err) => { console.log(err) })
      }
    }

  },

}

/**
 * 从请求体重解析出文件
 * 并将文件缓存到 /tmp 目录下
 * @param {HTTP INCOMING MESSAGE} req
 * @return {Promise}
 */
function resolveUploadFileFromRequest(request) {
  const maxSize = config.cos.maxSize ? config.cos.maxSize : 10

  // 初始化 multiparty
  const form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: maxSize * 1024 * 1024,
    autoFiles: true,
    uploadDir: '/tmp'
  })

  return new Promise((resolve, reject) => {
    // 从 req 读取文件
    form.parse(request, (err, fields = {}, files = {}) => {
      err ? reject(err) : resolve({ fields, files })
    })
  })
}