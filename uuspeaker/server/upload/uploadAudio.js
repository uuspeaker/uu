const debug = require('debug')('qcloud-sdk[CosUploader]')
const multiparty = require('multiparty')
const readChunk = require('read-chunk')
const shortid = require('shortid')
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
const upload = (req) => {
  const cos = new CosSdk({
    AppId: config.qcloudAppId,
    SecretId: config.qcloudSecretId,
    SecretKey: config.qcloudSecretKey,
    Domain: `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/`
  })

  const maxSize = config.cos.maxSize ? config.cos.maxSize : 10
  const fieldName = config.cos.fieldName ? config.cos.fieldName : 'file'

  debug('Cos sdk init finished')

  // 初始化 multiparty
  const form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: maxSize * 1024 * 1024,
    autoFiles: true,
    uploadDir: '/tmp'
  })

  // 从 req 读取文件
  form.parse(req, (err, fields = [], files = []) => {
    try{
    console.log('files is', files)
    var file = files.file[0]
    var audioId = fields.audioId[0]
    console.log('audioId is', audioId)

    // 生成上传传参数
    var srcpath = file.path
    var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
    // var params = {
    //   Bucket: config.cos.fileBucket,
    //   Region: config.cos.region,
    //   //Key: `${uploadFolder}${imgKey}`,
    //   Key: `${uploadFolder}${audioId}.${resultType.ext}`,
    //   Body: fs.createReadStream(srcpath),
    //   ContentLength: imageFile.size
    // }

    cos.sliceUploadFile({
      Bucket: config.cos.fileBucket,
      Region: config.cos.region,
      Key: `${uploadFolder}${audioId}.mp3`,
      FilePath: file.path
    }, function (err, data) {
      console.log(err, data);
      //fs.unlink(file.path, (err) => { console.log(err) })
    });
    }catch(e){
      console.log('upload fail',e)
    }

    // // 上传图片
    // cos.putObject(params, (err, data) => {
    //   console.log(err)
    //   //fs.unlink(srcpath, (err) => { console.log(err) })
    // })

})

    
}

module.exports = { upload }

