const { mysql } = require('../../qcloud')
const uploadAudio = require('../../upload/uploadAudio.js')
const audioToText = require('../../upload/audioToText.js')
const uuid = require('../../common/uuid.js')
const userInfo = require('../../common/userInfo')
const multiparty = require('multiparty')
const config = require('../../config')
const fs = require('fs')


var post = async (ctx) => {
    // const { fields, files } = await resolveUploadFileFromRequest(ctx.req)
    try {
      //保存音频文件
       await uploadAudio.upload(ctx)
      //将音频转化成文字
      // var audioArr = await audioToText(files)
      // ctx.state.data = audioArr
    } catch (e) {
      console.log('imromptuAudio fail', e)
    } finally {
      // if (files.file[0]) {
      //   fs.unlink(files.file[0].path, (err) => { console.log(err) })
      // }
    }
  }
  /**
 * 从请求体重解析出文件
 * 并将文件缓存到 /tmp 目录下
 * @param {HTTP INCOMING MESSAGE} req
 * @return {Promise}
 */
var resolveUploadFileFromRequest = async (request) => {
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



    module.exports = { post }