const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')
const userInfoService = require('../service/userInfoService')
const audioService = require('../service/audioService')

//创建专辑
var createAlbum = async (userId, albumName) => {

  var albumId = uuid.v1()
  await mysql('album_info').insert({
    user_id: userId,
    album_id: albumId,
    album_name: albumName
  })
}

//修改专辑
var modifyAlbum = async (albumId, albumName) => {
  await mysql('album_info').update({
    album_name: albumName
  }).where({ album_id: albumId,})
}

//删除专辑
var deleteAlbum = async (albumId) => {
  await mysql('album_info').where({
    album_id: albumId,
  }).del()

  await mysql('album_content').where({
    album_id: albumId,
  }).del()
}

//查询我的专辑
var getMyAlbum = async (userId, queryPageType, firstDataTime, lastDataTime, albumName) => {
  var limit = 10
  var offset = 0
  var albumData = []

  var albumNameQuery = 1
  if (albumName == '') {
    albumName = 1
  } else {
    albumName = albumName + '%'
    albumNameQuery = 'album_name'
  }

  if (queryPageType == 0) {
    albumData = await mysql('album_info').select('cSessionInfo.user_info', 'album_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'album_info.user_id').where({ 'album_info.user_id': userId}).andWhere(albumNameQuery, 'like', albumName).orderBy('album_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    albumData = await mysql('album_info').select('cSessionInfo.user_info', 'album_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'album_info.user_id').where({ 'album_info.user_id': userId}).andWhere(albumNameQuery, 'like', albumName).andWhere('album_info.create_date', '>', new Date(firstDataTime)).orderBy('album_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    albumData = await mysql('album_info').select('cSessionInfo.user_info', 'album_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'album_info.user_id').where({ 'album_info.user_id': userId}).andWhere(albumNameQuery, 'like', albumName).andWhere('album_info.create_date', '<', new Date(lastDataTime)).orderBy('album_info.create_date', 'desc').limit(limit).offset(offset)
  }


  for (var i = 0; i < albumData.length; i++) {
    albumData[i].user_info = userInfoService.getTailoredUserInfo(albumData[i].user_info)
  }
  return albumData
}

//查询所有专辑
var getAllAlbum = async (queryUserType, queryPageType, firstDataTime, lastDataTime, albumName) => {

  var limit = 10
  var offset = 0
  var albumData = []
  var albumNameQuery = 1
  if (albumName == '') {
    albumName = 1
  } else {
    albumName = albumName + '%'
    albumNameQuery = 'album_name'
  }

  if (queryPageType == 0) {
    albumData = await mysql('album_info').select('cSessionInfo.user_info', 'album_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'album_info.user_id').where(albumNameQuery, 'like', albumName).orderBy('album_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    albumData = await mysql('album_info').select('cSessionInfo.user_info', 'album_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'album_info.user_id').where('album_info.create_date', '>', new Date(firstDataTime)).andWhere(albumNameQuery, 'like', albumName).orderBy('album_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    albumData = await mysql('album_info').select('cSessionInfo.user_info', 'album_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'album_info.user_id').where('album_info.create_date', '<', new Date(lastDataTime)).andWhere(albumNameQuery, 'like', albumName).orderBy('album_info.create_date', 'desc').limit(limit).offset(offset)
  }

  for (var i = 0; i < albumData.length; i++) {
    albumData[i].user_info = userInfoService.getTailoredUserInfo(albumData[i].user_info)
  }
  return albumData
}

//将音频添加到专辑
var saveAlbumContent = async (albumId, audioId) => {
  await mysql('album_content').where({
    album_id: albumId,
    audio_id: audioId
  }).del()
  await mysql('album_content').insert({
    album_id: albumId,
    audio_id: audioId
  })

  await updataAlbumContentAmount(albumId)
}

//将音频从专辑删除
var deleteAlbumContent = async (albumId, audioId) => {
  await mysql('album_content').where({
    album_id: albumId,
    audio_id: audioId
  }).del()

  await updataAlbumContentAmount(albumId)
}

//跟新专辑中音频个数
var updataAlbumContentAmount = async (albumId) => {
  var data = await mysql('album_content').where({ album_id: albumId })
  await mysql('album_info').update({
    audio_amount: data.length
  }).where({ album_id: albumId})
}

var getAlbumContent = async (queryPageType, firstDataTime, lastDataTime, albumId) => {
  var limit = 10
  var offset = 0
  var taskData = []

  if (queryPageType == 0) {
    taskData = await mysql('album_content').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'album_content.audio_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where({ 'album_content.album_id': albumId }).select('cSessionInfo.user_info', 'impromptu_audio.*').orderBy('album_content.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    taskData = await mysql('album_content').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'album_content.audio_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where('album_content.create_date', '>', new Date(firstDataTime)).andWhere({ 'album_content.album_id': albumId }).select('cSessionInfo.user_info', 'impromptu_audio.*').orderBy('album_content.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    taskData = await mysql('album_content').innerJoin('impromptu_audio', 'impromptu_audio.audio_id', 'album_content.audio_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'impromptu_audio.user_id').where('album_content.create_date', '<', new Date(lastDataTime)).andWhere({ 'album_content.album_id': albumId }).select('cSessionInfo.user_info', 'impromptu_audio.*').orderBy('album_content.create_date', 'desc').limit(limit).offset(offset)
  }

  for (var i = 0; i < taskData.length; i++) {
    taskData[i].src = audioService.getSrc(taskData[i].audio_id)
    taskData[i].user_info = userInfoService.getTailoredUserInfo(taskData[i].user_info)
  }
  return taskData
}

module.exports = {
  createAlbum,
  modifyAlbum,
  deleteAlbum,
  getMyAlbum,
  getAllAlbum,
  saveAlbumContent,
  deleteAlbumContent,
  getAlbumContent,
}