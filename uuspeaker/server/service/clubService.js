const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')
const userInfoService = require('../service/userInfoService')


//创建俱乐部
var createClub = async (userId, clubName, clubDescription) => {
  var clubId = uuid.v1()
  await mysql('club_info').insert({
    user_id: userId,
    club_id: clubId,
    club_name: clubName,
    club_description: clubDescription
  })
  await mysql('club_member').insert({
    user_id: userId,
    club_id: clubId,
    role_type: 1
  })
}

//查询俱乐部列表
var getClubList = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var clubData = []

  if (queryPageType == 0) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.user_id').where({ 'club_info.user_id': userId}).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.user_id').where({ 'club_info.user_id': userId}).andWhere('club_info.create_date', '>', new Date(firstDataTime)).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.user_id').where({ 'club_info.user_id': userId}).andWhere('club_info.create_date', '<', new Date(lastDataTime)).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }

  for (var i = 0; i < clubData.length; i++) {
    //clubData[i].src = audioService.getSrc(clubData[i].audio_id)
    clubData[i].user_info = userInfoService.getTailoredUserInfo(clubData[i].user_info)
  }
  return clubData
}

//查询自己的俱乐部信息
var getMyClubInfo = async (userId) => {
  var clubInfo = await mysql('club_info').select('cSessionInfo.user_info','club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.user_id').innerJoin('club_member', 'club_member.club_id', 'club_info.club_id').where({ 'club_member.user_id': userId })

  if (clubInfo.length > 0){
    var clubId = clubInfo[0].club_id
    var memberList = await getClubMember(clubId)
    clubInfo[0].userInfo = userInfoService.getTailoredUserInfo(clubInfo[0].user_info)
    if (clubInfo[0].userId == userId){
      clubInfo[0].myRole = 1
    }else{
      clubInfo[0].myRole = 0
    }
  }

  return {
    clubInfo: clubInfo,
    memberList: memberList
  }
}

//查询俱乐部信息
var getClubInfoById = async (clubId) => {
  var clubInfo = await mysql('club_info').select('club_info.*').where({ 'club_info.club_id': clubId })

  var memberList = await getClubMember(clubId)

  return {
    clubInfo: clubInfo,
    memberList: memberList
  }
}

//查询俱乐部成员信息
var getClubMember = async (clubId) => {

  var memberList = await mysql('club_member').innerJoin('user_study_duration', 'club_member.user_id', 'user_study_duration.user_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_member.user_id').where({ 'club_member.club_id': clubId }).select('cSessionInfo.user_info', 'club_member.role_type', mysql.raw('sum(study_duration) as totalDuration')).groupBy('cSessionInfo.user_info', 'club_member.role_type').orderBy('club_member.role_type','asc','totalDuration', 'desc')
  for (var i = 0; i < memberList.length; i++) {
    memberList[i].user_info = userInfoService.getTailoredUserInfo(memberList[i].user_info)
  }
    return memberList
}

//退出俱乐部
var cancelClub = async (clubId,userId) => {
  await mysql('club_member').where({club_id: clubId, user_id: userId}).del()
}

//解散俱乐部
var dismissClub = async (clubId, userId) => {
  var clubInfo = await mysql('club_info').select('club_info.*').where({ 'club_info.club_id': clubId })
  if (clubInfo.length > 0 && clubInfo[0].user_id == userId){
    await mysql('club_info').where({ club_id: clubId }).del()
    await mysql('club_member').where({ club_id: clubId }).del()
  }
  
}

module.exports = {
  createClub,
  getClubList,
  getMyClubInfo,
  getClubInfoById,
  getClubMember,
  cancelClub,
  dismissClub
}