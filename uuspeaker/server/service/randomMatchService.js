const { mysql } = require('../qcloud')
const uuid = require('../common/uuid.js')
const log = require('../log');

var waitTime = 30000
var standByList = []
var matchedList = []
var onlineList = []

var enterRoom = (userInfo) => {
  var onlineListLegnth = onlineList.length
  for (var i = 0; i < onlineListLegnth; i++) {
    if (onlineList[i].userInfo == userInfo) {
      onlineList[i].startDate = new Date()
      return onlineList
    } 
  }
  var newUser = { 'userInfo': userInfo, 'startDate': new Date() }
  onlineList.unshift(newUser)
  log.info('用户进入房间' + JSON.stringify(newUser))
  log.info('当前在房间的所有用户' + JSON.stringify(userInfo))
  return onlineList
}

//用户停止匹配
var leaveRoom = (userId) => {
  var onlineListLegnth = onlineList.length
  for (var i = 0; i < onlineListLegnth; i++) {
    if (onlineList[i].userInfo.userId == userId) {
      var removedUser = onlineList.splice(i, 1)
      log.info('用户离开房间' + JSON.stringify(removedUser))
      log.info('当前在房间的所有用户' + JSON.stringify(onlineList))
      return
    }
  }
}

//定期删除超过30秒还未匹配到的用户
var removeOfflineUser = () => {
  var now = new Date()
  var onlineListLegnth = onlineList.length
  var removeAmount = 0
  for (var i = 0; i < onlineListLegnth; i++) {
    var lastSeconds = Math.floor(now - onlineList[i].startDate)
    if (lastSeconds >= waitTime) {
      var removedUser = onlineList.splice(i - removeAmount, 1)
      log.info('30秒后将用户从在线列表删除' + JSON.stringify(removedUser))
      log.info('当前在线的所有用户' + JSON.stringify(onlineList))
      removeAmount++
    }
  }
}

//用户停止匹配
var getOnlineUser = () => {
  return onlineList
}

var startMatch = (userInfo) => {
  var standByListLegnth = standByList.length
  for (var i = 0; i < standByListLegnth; i++) {
    if (standByList[i].userInfo.userId == userInfo.userId){
      standByList[i].startDate = new Date()
      return
    }
  }
  var matchedListLegnth = matchedList.length
  for (var i = 0; i < matchedListLegnth; i++) {
    if (matchedList[i].userInfo.userId == userInfo.userId) return
  }
  var newUser = { 'userId': userInfo, 'startDate': new Date() }
  standByList.unshift(newUser)
  log.info('用户开始匹配' + JSON.stringify(newUser))
  log.info('当前正在等待匹配的所有用户' + JSON.stringify(standByList))
}

//定期删除超过30秒还未匹配到的用户
var removeUnmatchUser = () => {
  var now = new Date()
  var standByListLegnth = standByList.length
  var removeAmount = 0
  for (var i = 0; i < standByListLegnth; i++) {
    var lastSeconds = Math.floor(now - standByList[i].startDate)
    if (lastSeconds >= waitTime) {
      var removedUser = standByList.splice(i - removeAmount, 1)
      log.info('30秒后还未匹配到，将用户从等待列表删除' + JSON.stringify(removedUser))
      log.info('当前正在等待匹配的所有用户' + JSON.stringify(standByList))
      removeAmount++
    }
  }
}

//用户停止匹配
var stopMatch = (userId) => {
  var standByListLegnth = standByList.length
  var removeAmount = 0
  for (var i = 0; i < standByListLegnth; i++) {
    if (standByList[i].userInfo.userId == userId) {
      var removedUser = standByList.splice(i, 1)
      log.info('用户取消匹配' + JSON.stringify(removedUser))
      log.info('当前正在等待匹配的所有用户' + JSON.stringify(standByList))
      return
    }
  }
}

//定期删除匹配到了但未参加的用户
var removeMatchUser = () => {
  var now = new Date()
  var matchedListLegnth = matchedList.length
  var removeAmount = 0
  for (var i = 0; i < matchedListLegnth; i++) {
    var lastSeconds = Math.floor(now - matchedList[i].startDate)
    if (lastSeconds >= waitTime) {
      var removedUser = matchedList.splice(i - removeAmount, 1)
      log.info('匹配成功后30秒用户未响应，将用户从匹配成功列表删除' + JSON.stringify(removedUser))
      log.info('当前所有匹配成功的用户' + JSON.stringify(standByList))
      removeAmount++
    }
  }
}

var autoMatchUser = () => {
  //console.log('自动匹配心跳检查')
  //console.log('standByList', standByList)
  //console.log('matchedList', matchedList)
  removeUnmatchUser()
  removeMatchUser()
  var matchTimes = Math.floor(standByList.length / 2)
  for (var i = 0; i < matchTimes; i++) {
    var roomId = uuid.v1()
    var matchUserA = standByList.pop()
    var matchUserB = standByList.pop()
    matchedList.push({ userInfo: matchUserA, partnerInfo: matchUserB, roomId: roomId, enterType: 'create',startDate: new Date()})
    matchedList.push({ userInfo: matchUserB, partnerInfo: matchUserA,roomId: roomId, enterType: 'enter',startDate: new Date() })
    log.info('匹配成功，将匹配成功的两个用户从等待列表删除，转移到匹配成功列表' + JSON.stringify(matchUserA) + JSON.stringify(matchUserB))
  }
}

var getMatchInfo = (userId) => {
  var length = matchedList.length
  for (var i = 0; i < length; i++) {
    if (matchedList[i].userInfo.userId == userId) {
      var removedUser = matchedList.splice(i, 1)
      log.info('匹配成功，将用户从匹配成功列表删除' + JSON.stringify(removedUser))
      return removedUser[0]
    }
  }
  return 0
}

//定期删除超过20分钟的房间
var removeOfflineRooms = () => {
  var now = new Date()
  var roomListLegnth = roomList.length
  var removeAmount = 0
  for (var i = 0; i < roomListLegnth; i++) {
    var lastTime = Math.floor(now - roomList[i].startDate)
    if (lastTime >= roomTime) {
      var removedRoom = roomList.splice(i - removeAmount, 1)
      log.info('20分钟后将房间删除' + JSON.stringify(removedRoom))
      removeAmount++
    }
  }
}

// setInterval(autoMatchUser, 1 * 1000);
// setInterval(removeOfflineUser, 5 * 1000);

module.exports = { enterRoom, leaveRoom, startMatch, stopMatch,autoMatchUser, getMatchInfo }