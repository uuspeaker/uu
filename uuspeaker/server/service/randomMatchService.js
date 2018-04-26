const { mysql } = require('../qcloud')
const uuid = require('../common/uuid.js')

var waitTime = 10000
var standByList = []
var matchedList = []

var startMatch = async (userId) => {
  var standByListLegnth = standByList.length
  for (var i = 0; i < standByListLegnth; i++) {
    if (standByList[i].user_id == userId)return
  }
  standByList.unshift({ 'userId': userId,'startDate': new Date()})
}

//定期删除超过30秒还未匹配到的用户
var removeUnmatchUser = async () => {
  var now = new Date()
  var standByListLegnth = standByList.length
  var removeAmount = 0
  for (var i = 0; i < standByListLegnth; i++) {
    var lastSeconds = Math.floor(now - standByList[i].startDate)
    if (lastSeconds >= waitTime) {
      var removedUser = standByList.splice(i - removeAmount, 1)
      console.log('remove standBy user', removedUser)
      removeAmount++
    }
  }
}

//定期删除匹配到了但未参加的用户
var removeMatchUser = async () => {
  var now = new Date()
  var matchedListLegnth = matchedList.length
  var removeAmount = 0
  for (var i = 0; i < matchedListLegnth; i++) {
    var lastSeconds = Math.floor(now - matchedList[i].startDate)
    if (lastSeconds >= waitTime) {
      var removedUser = matchedList.splice(i - removeAmount, 1)
      console.log('remove match user', removedUser)
      removeAmount++
    }
  }
}

var matchUser = async () => {
  console.log('自动匹配心跳检查')
  console.log('standByList', standByList)
  console.log('matchedList', matchedList)
  removeUnmatchUser()
  removeMatchUser()
  var matchTimes = Math.floor(standByList.length / 2)
  for (var i = 0; i < matchTimes; i++) {
    var roomId = uuid.v1()
    matchedList.push({ userInfo: standByList.pop(), 'roomId': roomId ,'startDate': new Date()})
    matchedList.push({ userInfo: standByList.pop(), 'roomId': roomId, 'startDate': new Date() })
  }
}

var getMatchInfo = async (userId) => {
  var length = matchedList.length
  for (var i = 0; i < length; i++) {
    if (matchedList[i].userInfo.userId == userId) {
      var matchInfo = matchedList.splice(i, 1)
      return matchInfo.roomId
    }
  }
  return 0
}

setInterval(matchUser, 1 * 1000);

module.exports = { startMatch, matchUser, getMatchInfo }