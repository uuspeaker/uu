const debug = require('debug')('qcloud-sdk[CosUploader]')
const multiparty = require('multiparty')
const fs = require('fs')
const fileType = require('file-type')
const CosSdk = require('cos-nodejs-sdk-v5')
const ERRORS = require('constants').ERRORS
const config = require('../config')

const regionMap = {
  'ap-beijing-1': 'tj',
  'ap-beijing': 'bj',
  'ap-shanghai': 'sh',
  'ap-guangzhou': 'gz',
  'ap-chengdu': 'cd',
  'ap-singapore': 'sgp',
  'ap-hongkong': 'hk',
  'na-toronto': 'ca',
  'eu-frankfurt': 'ger'
}



/**
 * 对象上传 API
 * @param {express request} req
 * @return {Promise} 上传任务的 Promise 对象
 */

// 初始化 sdk
const upload = async (ctx) => {
  const cos = new CosSdk({
    AppId: config.qcloudAppId,
    SecretId: config.qcloudSecretId,
    SecretKey: config.qcloudSecretKey,
    Domain: `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/`
  })

  debug('Cos sdk init finished')

  // 处理文件上传
  const { fields, files } = await resolveUploadFileFromRequest(ctx.req)

  // 从 req 读取文件

    console.log('files is', files)
    var file = files.file[0]
    var audioId = fields.audioId[0]
    console.log('audioId is', audioId)

    // 生成上传传参数
    var srcpath = file.path
    var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''

    cos.sliceUploadFile({
      Bucket: config.cos.fileBucket,
      Region: config.cos.region,
      Key: `${uploadFolder}${audioId}.mp3`,
      FilePath: file.path
    }, function (err, data) {
      console.log(err, data);
      fs.unlink(file.path, (err) => { console.log(err) })
    });
  
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

module.exports = { upload }

