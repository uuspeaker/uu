const { mysql } = require('../qcloud')
const userInfo = require('../common/userInfo.js')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')
const config = require('../config')

/**
 * 给音频点赞(若此前已经点赞则不做任何处理) 
 * audioId 音频ID
 * userId 当前点赞用户
 * 返回：0-之前已经点赞 1-点赞成功
 */
var likeAudio = async (audioId,userId) => {
  var audioLikeUser = await mysql('impromptu_audio_like').where({ audio_id: audioId,use_id: userId })
  if (audioLikeUser.length == 0){
    var audioView = await mysql('impromptu_audio').select('like_amount').where({ audio_id: audioId })
    await mysql('impromptu_audio').update({
      like_amount: audioView[0].like_amount + 1
    }).where({ audio_id: audioId })

    await mysql('impromptu_audio_like').insert({
      audio_id: audioId,
      user_id: userId
    })
    return 1
  }else{
    return 0
  }
}

/**
 * 更新音频察看次数
 * audioId 音频ID
 * 返回：0-之前已经点赞 1-点赞成功
 */
var viewAudio = async (audioId) => {
  var audioView = await mysql('impromptu_audio').select('view_amount').where({ audio_id: audioId })
  await mysql('impromptu_audio').update({
    view_amount: audioView[0].view_amount + 1
  }).where({ audio_id: audioId })
}

/**
 * 获取音频的点赞用户 
 * audioId 音频ID
 * 返回：
 */
var getAudioLikeUser = async (audioId) => {
  var audioData = await mysql('impromptu_audio_like').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio_like.user_id').select('impromptu_audio_like.*', 'cSessionInfo.user_info').where({ audio_id: audioId })

  for (var i = 0; i < audioData.length; i++) {
    audioData[i].user_info = userInfo.getUserInfo(audioData[i].user_info)
  }
  return audioData
}

/**
 * 获取当前正在进行的音频(主要用于实时点赞) 
 * audioId 音频ID
 * 返回：
 */
var getSpeakingAudio = async (roomId) => {
  var audioData = await mysql('impromptu_audio').where({ room_id: roomId, audio_status: 1 }).orderBy('create_date', 'desc')
  return audioData
}

/**
 * 开始演讲(开始演讲时,提前保存音频信息,便于记录其他人的点赞) 
 * 注:演讲结束时须调用completeSpeechAudio将状态由1(未完成)更新成2(已完成)
 * audioId 音频ID
 * 返回：
 */
var startSpeechAudio = async (roomId, audioId, audioName, userId, timeDuration) => {
  await mysql('impromptu_audio').insert({
    audio_id: audioId,
    audio_name: audioName,
    user_id: userId,
    room_id: roomId,
    time_duration: timeDuration,
    audio_type: 1,
    audio_status: 1
  })
}

/**
 * 开始演讲(开始演讲时,提前保存音频信息,便于记录其他人的点赞) 
 * 注:演讲结束时许将状态由1(未完成)更新成2(已完成)
 * audioId 音频ID
 * timeDuration 音频长度
 * 返回：
 */
var completeSpeechAudio = async ( audioId, timeDuration) => {
  await mysql('impromptu_audio').update(
    {
      time_duration: timeDuration,
      audio_status: 2
    }).where({
      audio_id: audioId
    })
}

/**
 * 给房间最近完成的演讲点评 
 * audioId 点评音频ID
 * 返回：
 */
var evaluateLatestAudio = async (roomId, evaluationAudioId, audioName, userId, timeDuration) => {
  //获取最近完成的演讲
  var audioData = await mysql('impromptu_audio').where({ room_id: roomId, audio_type: 1, audio_status: 2 }).orderBy('impromptu_audio.create_date', 'desc')

  if (audioData.length > 0) {
    var speechAudioId = audioData[0].audio_id
    //更新演讲的点评次数
    evaluateAudio(roomId, evaluationAudioId, audioName, userId, timeDuration, speechAudioId)
  }
}

/**
 * 给演讲点评 
 * audioId 点评音频ID
 * 返回：
 */
var evaluateAudio = async (roomId, evaluationAudioId, audioName, userId, timeDuration, speechAudioId) => {
  //获取最近完成的演讲
  var audioData = await mysql('impromptu_audio').where({ audio_id: speechAudioId})

  if (audioData.length > 0) {
    //更新演讲的点评次数
    await mysql('impromptu_audio').update({
      comment_amount: audioData[0].comment_amount + 1
    }).where({ audio_id: speechAudioId })

    await mysql('impromptu_audio').insert({
      audio_id: evaluationAudioId,
      audio_name: audioName,
      user_id: userId,
      room_id: roomId,
      time_duration: timeDuration,
      audio_type: 2,
      audio_status: 1,
      relate_audio: speechAudioId
    })
  }
}

/**
 * 获取房间所有演讲音频(判断登陆人是否点赞过,组装好音频src) 
 * roomId 房间号
 * userId 登陆人ID
 * 返回：
 */
var getSpeechAudioByRoom = async (roomId,  userId) => {
  var audioData = await mysql('impromptu_audio').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').select('impromptu_audio.*', 'cSessionInfo.user_info').orderBy('impromptu_audio.create_date', 'asc').where({ room_id: roomId, audio_type: 1, audio_status: 2 })

  var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
  for (var i = 0; i < audioData.length; i++) {
    audioData[i].user_info = userInfo.getUserInfo(audioData[i].user_info)
    audioData[i].isMine = 0
    audioData[i].src = `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${audioData[i].audio_id}.mp3`
    if (userId == audioData[i].user_id) {
      audioData[i].isMine = 1
    }
  }
  return audioData
}

/**
 * 保存演讲记录 
 * 返回：
 */
var saveAudio = async (audioId, userId, timeDuration) => {
  await mysql('impromptu_audio').insert({
    audio_id: audioId,
    user_id: userId,
    time_duration: timeDuration,
    audio_type: 1,
    audio_status: 2
  })
}

var getSrc = async (audioId) => {
  var uploadFolder = config.cos.uploadFolder ? config.cos.uploadFolder + '/' : ''
  var src = `http://${config.cos.fileBucket}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${audioId}.mp3`
  return src
}

/**
 * 删除某个音频
 */
var deleteAudio = async (audioId) => {
 await mysql('impromptu_audio').where({ audio_id: audioId }).del()
}

module.exports = { likeAudio, viewAudio, getAudioLikeUser, getSpeakingAudio, startSpeechAudio, completeSpeechAudio, evaluateLatestAudio, evaluateAudio, getSpeechAudioByRoom, saveAudio, getSrc }