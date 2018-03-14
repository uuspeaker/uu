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

/**
 * 对象上传 API
 * @param {express request} req
 * @return {Promise} 上传任务的 Promise 对象
 */

    // 初始化 sdk
const upload = (req) => {
     

    return new Promise((resolve, reject) => {
        // 从 req 读取文件
        form.parse(req, (err, fields = {}, files = {}) => {
            err ? reject(err) : resolve({fields, files})
        })
    }).then(({fields,files}) => {

        const imageFile = files.file[0]
        const audioId = fields.audioId[0]

        // 判断文件类型
        const buffer = readChunk.sync(imageFile.path, 0, 262)
        const resultType = fileType(buffer)

        // 生成上传传参数
        const srcpath = imageFile.path
        const imgKey = `${Date.now()}-${shortid.generate()}.${resultType.ext}`
        const uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
        const params = {
            Bucket: config.cos.fileBucket,
            Region: config.cos.region,
            //Key: `${uploadFolder}${imgKey}`,
            Key: `${uploadFolder}${audioId}.${resultType.ext}`,
            Body: fs.createReadStream(srcpath),
            ContentLength: imageFile.size
        }
        return new Promise((resolve, reject) => {
            cos.getService(params, (err, data) => {
                if (err) {
                    reject(err)
                    // remove uploaded file
                    fs.unlink(srcpath)
                }
                resolve()
            })
        }).then(() => {
            return new Promise((resolve, reject) => {
                // 上传图片
                cos.putObject(params, (err, data) => {
                    if (err) {
                        reject(err)
                        // remove uploaded file
                        fs.unlink(srcpath)
                    }

                    resolve({
                        imgUrl: `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos${regionMap[config.cos.region]}.myqcloud.com/${imgKey}`,
                        size: imageFile.size,
                        mimeType: resultType.mime,
                        name: imgKey
                    })

                    // remove uploaded file
                    fs.unlink(srcpath)
                })
            })
        })
    }).catch(e => {
      console.log('upload fail',e)
        if (e.statusCode === 413) {
            debug('%s: %o', ERRORS.ERR_FILE_EXCEEDS_MAX_SIZE, e)
            throw new Error(`${ERRORS.ERR_FILE_EXCEEDS_MAX_SIZE}\n${e}`)
        } else {
            throw e
        }
    })
    
}

module.exports = { upload }

