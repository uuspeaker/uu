const { mysql } = require('../qcloud')
const dateUtil = require('../common/dateUtil.js')
const uuid = require('../common/uuid.js')
const userInfoService = require('../service/userInfoService')
const audioService = require('../service/audioService.js')

//创建俱乐部
var createClub = async (userId, clubName, clubDescription, audioId, timeDuration) => {
  var clubData = await mysql('club_info').where({
    'user_id': userId
  })
  if (clubData.length > 0)return 9

  await mysql('club_apply').where({
    user_id: userId,
    apply_status: 1
  }).del()

  var clubId = uuid.v1()
  await mysql('club_info').insert({
    user_id: userId,
    club_id: clubId,
    club_name: clubName,
    member_amount: 1,
    club_description: clubDescription,
    audio_id: audioId,
    time_duration: timeDuration
  })
  await mysql('club_member').insert({
    user_id: userId,
    club_id: clubId,
    role_type: 1
  })
  return 1
}

//修改俱乐部
var updateClub = async (clubId, clubName, clubDescription, audioId, timeDuration) => {
  await mysql('club_info').update({
    club_name: clubName,
    club_description: clubDescription,
    audio_id: audioId,
    time_duration: timeDuration
  }).where({
    club_id: clubId
  })
}

//查询俱乐部列表
var getClubList = async (userId, queryPageType, firstDataTime, lastDataTime) => {
  var limit = 10
  var offset = 0
  var clubData = []

  if (queryPageType == 0) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.user_id').orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 1) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.user_id').where('club_info.create_date', '>', new Date(firstDataTime)).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
  }

  if (queryPageType == 2) {
    clubData = await mysql('club_info').select('cSessionInfo.user_info', 'club_info.*').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_info.user_id').where('club_info.create_date', '<', new Date(lastDataTime)).orderBy('club_info.create_date', 'desc').limit(limit).offset(offset)
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
    clubInfo[0].src = audioService.getSrc(clubInfo[0].audio_id)
    if (clubInfo[0].userInfo.userId == userId){
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

  var memberList = await mysql('club_member').innerJoin('user_study_duration', 'club_member.user_id', 'user_study_duration.user_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_member.user_id').where({ 'club_member.club_id': clubId }).select('cSessionInfo.user_info', 'club_member.role_type', 'club_member.notice', mysql.raw('sum(study_duration) as totalDuration')).groupBy('cSessionInfo.user_info', 'club_member.role_type', 'club_member.notice').orderBy('club_member.role_type','asc','totalDuration', 'desc')
  for (var i = 0; i < memberList.length; i++) {
    memberList[i].user_info = userInfoService.getTailoredUserInfo(memberList[i].user_info)
  }
    return memberList
}

//退出俱乐部
var cancelClub = async (clubId,userId) => {
  await mysql('club_member').where({club_id: clubId, user_id: userId}).del()
  await updateMemberAmount(clubId)
}

//解散俱乐部
var dismissClub = async (clubId, userId) => {
  var clubInfo = await mysql('club_info').select('club_info.*').where({ 'club_info.club_id': clubId })
  if (clubInfo.length > 0 && clubInfo[0].user_id == userId){
    await mysql('club_info').where({ club_id: clubId }).del()
    await mysql('club_member').where({ club_id: clubId }).del()
  }
  
}

//查询用户学习排名
var getStudyRank = async (clubId) => {
  var limit = 100
  var offset = 0
  var data = await mysql('club_member').innerJoin('user_study_duration', 'club_member.user_id', 'user_study_duration.user_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_member.user_id').where({
    'club_member.club_id': clubId
  }).select('cSessionInfo.user_info', mysql.raw('sum(study_duration) as totalDuration')).groupBy('cSessionInfo.user_info').orderBy('totalDuration', 'desc').limit(limit).offset(offset)
  for (var i = 0; i < data.length; i++) {
    data[i].user_info = userInfoService.getTailoredUserInfo(data[i].user_info)
  }
  return data
}

//查询用户学习增长排名
var getIncreaseRank = async (clubId) => {
  var today = dateUtil.getToday()
  var limit = 100
  var offset = 0
  var data = await mysql('club_member').innerJoin('user_study_duration', 'club_member.user_id', 'user_study_duration.user_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_member.user_id').where({
    'club_member.club_id': clubId, 'user_study_duration.study_date': today
  }).select('cSessionInfo.user_info', mysql.raw('sum(study_duration) as totalDuration')).groupBy('cSessionInfo.user_info').orderBy('totalDuration', 'desc').limit(limit).offset(offset)
  for (var i = 0; i < data.length; i++) {
    data[i].user_info = userInfoService.getTailoredUserInfo(data[i].user_info)
  }
  return data
}

//更新用户角色
var updateUserIdentity = async (clubId, userId, updateType) => {
  var data = await mysql('club_member').where({
    club_id: clubId,
    user_id: userId,
  }).update({
    role_type: updateType
  })
}

//更新用户备注
var updateUserNotice = async (clubId, userId, userNotice) => {
  var data = await mysql('club_member').where({
    club_id: clubId,
    user_id: userId,
  }).update({
    notice: userNotice
  })
}

//查询用户是否已经在俱乐部中
var isInClub = async (userId) => {
  var data = await mysql('club_member').where({
    user_id: userId
  })
  if(data.length > 0){
    return true
  }else{
    return false
  }
}

//申请加入俱乐部
var applyClub = async (userId, clubId, audioId) => {
  await mysql('club_apply').where({
    user_id: userId,
    apply_status: 1
  }).del()

  await mysql('club_apply').insert({
    user_id: userId,
    club_id: clubId,
    notice: audioId,
    apply_status: 1
  })
}

//查询申请入会的人数
var getApplyUserAmount = async (clubId) => {
  var data = await mysql('club_apply').where({
    club_id: clubId,
    apply_status: 1,
  })
  return data.length
}

//查询申请入会的人员信息
var getApplyUserList = async (clubId) => {
  var data = await mysql('club_apply').leftJoin('user_study_duration', 'club_apply.user_id', 'user_study_duration.user_id').innerJoin('cSessionInfo', 'cSessionInfo.open_id', 'club_apply.user_id').where({
    'club_apply.club_id': clubId,
    'club_apply.apply_status': 1,
  }).groupBy('cSessionInfo.user_info', 'club_apply.notice').select('cSessionInfo.user_info', 'club_apply.notice', mysql.raw('sum(user_study_duration.study_duration) as totalDuration'))
  for (var i = 0; i < data.length; i++) {
    data[i].userInfo = userInfoService.getTailoredUserInfo(data[i].user_info)
  }
  return data
}

//同意入会申请 
var passApply = async (clubId,userId) => {
  await mysql('club_apply').where({
    club_id: clubId,
    user_id: userId,
    apply_status: 1,
  }).update({
    apply_status: 2,
  })

  await mysql('club_member').insert({
    user_id: userId,
    club_id: clubId,
    role_type: 9
  })

  await updateMemberAmount(clubId)
}

//拒绝入会申请
var denyApply = async (clubId,userId) => {
  await mysql('club_apply').where({
    club_id: clubId,
    user_id: userId,
    apply_status: 1,
  }).update({
    apply_status: 9,
  })

  await updateMemberAmount(clubId)
}

//更新会员人数
var updateMemberAmount = async (clubId) => {
  var member = await mysql('club_member').where({
    club_id: clubId,
  })

  await mysql('club_info').where({
    club_id: clubId,
  }).update({
    member_amount: member.length
  })
}

module.exports = {
  createClub,
  updateClub,
  getClubList,
  getMyClubInfo,
  getClubInfoById,
  getClubMember,
  cancelClub,
  dismissClub,
  getStudyRank,
  getIncreaseRank,
  updateUserIdentity,
  updateUserNotice,
  isInClub,
  applyClub,
  getApplyUserAmount,
  getApplyUserList,
  passApply,
  denyApply
}