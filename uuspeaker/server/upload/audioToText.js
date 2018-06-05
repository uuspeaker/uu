const { voice } = require('../qcloud')
const ffmpeg = require('fluent-ffmpeg')
const multiparty = require('multiparty')
const readChunk = require('read-chunk')
const fileType = require('file-type')
const shortid = require('shortid')
const fs = require('fs')
const config = require('../config')
const log = require('../log');

/**
 * 语音识别
 * 这里使用流式语音识别
 * 有任何问题可以到 issue 提问
 */
module.exports = async files => {
  log.info('audioToText开始')
  // 处理文件上传
  //const { files } = await resolveUploadFileFromRequest(ctx.req)
  const imageFile = files.file[0]
  log.info('audioToText', imageFile)
  // 只能上传 mp3 文件
  const buffer = readChunk.sync(imageFile.path, 0, 262)
  let resultType = fileType(buffer)

  const srcPath = imageFile.path
  /**
   * 语音识别只支持如下编码格式的音频：
   * pcm、adpcm、feature、speex、amr、silk、wav
   * 所以必须把 mp3 格式的上传文件转换为 wav
   * 这里使用 ffmpeg 对音频进行转换
   */
  const newVoiceKey = `voice-${Date.now()}-${shortid.generate()}.wav`
  const newVoicePath = `/tmp/${newVoiceKey}`
  const voiceId = genRandomString(16)
  await convertMp3ToWav(srcPath, newVoicePath)

  const voiceBuffer = fs.readFileSync(newVoicePath)
  log.info('audioToText voiceBuffer', voiceBuffer)
  const taskList = []
  let leftBufferSize = 0
  let idx = 0

  while (leftBufferSize < voiceBuffer.length) {
    const newBufferSize = leftBufferSize + 9 * 1024
    const chunk = voiceBuffer.slice(leftBufferSize, newBufferSize > voiceBuffer.length ? voiceBuffer.length : newBufferSize)
    log.info('audioToText chunk', chunk)
    taskList.push(
      voice.recognize(chunk, newBufferSize > voiceBuffer.length, voiceId, idx)
    )

    leftBufferSize = newBufferSize
    idx++
  }

  try {
    const data = await Promise.all(taskList)
    const res = data.map(d => d.data)
    console.log(res)
    return getAudioText(res)
  } catch (e) {
    console.log(e)
    throw e
  }
}

function genRandomString(len) {
  let text = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < len; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return text
}

/**
 * mp3 转 wav
 * @param {string} srcPath 源文件地址
 * @param {string} newPath 新文件地址
 */
function convertMp3ToWav(srcPath, newPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(srcPath)
      .format('wav')
      .on('error', reject)
      .on('end', function () {
        resolve(newPath)
      })
      .save(newPath)
  })
}

function getAudioText(data){

  if (typeof data === 'string') {
    data = JSON.parse(data);
  }


  const result = data.reduce((pre, cur, idx) => {
    if (pre.hasError) {
      return pre;
    }

    if (cur.code !== 0) {
      pre.hasError = true;
      pre.errMsg = message;
    }

    pre.text = cur.text;
    return pre;
  }, { text: '', hasError: false, errMsg: '' });

  if (!result.hasError) {
    // const notes = this.data.notes.map(v => {
    //   if (v.key === key) {
    //     v.word = result.text;
    //     v.isRec = true;
    //   }
    //   return v;
    // });
    
    console.log('audio text result', result)
    return result.text
  } else {
    console.error(result, data);
  }
}
