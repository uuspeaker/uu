const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')
const userInfoService = require('../service/userInfoService')


//创建俱乐部
var createClub = async (userId, clubName, clubDescription) => {
  await mysql('club_info').insert({
    create_user_id: userId,
    club_id: uuid.v1(),
    club_name: clubName,
    club_description: clubDescription
  })
}

//查询俱乐部列表
var getClubList = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var clubData = []

  if (queryPageType == 0) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.create_user_id').where({ 'club_info.create_user_id': userId}).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.create_user_id').where({ 'club_info.create_user_id': userId}).andWhere('club_info.create_date', '>', new Date(firstDataTime)).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.create_user_id').where({ 'club_info.create_user_id': userId}).andWhere('club_info.create_date', '<', new Date(lastDataTime)).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }


  for (var i = 0; i < clubData.length; i++) {
    //clubData[i].src = audioService.getSrc(clubData[i].audio_id)
    clubData[i].user_info = userInfoService.getTailoredUserInfo(clubData[i].user_info)
  }
  return clubData
}

module.exports = {
  createClub,
  getClubList
}