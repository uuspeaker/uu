const { mysql } = require('../qcloud')
const uuid = require('../common/uuid.js')
const log = require('../log');
const audioService = require('../service/audioService.js')

var waitTime = 30000
var roomTime = 1200000
var standByList = []
var matchedList = []
var roomList = []
var onlineList = []
var speechNames = []


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

var initSpeechNames = async () => {
  speechNames = await mysql("speech_name_info").select('speech_name')
}


var startMatch = (userInfo) => {
  
  var standByListLegnth = standByList.length
  for (var i = 0; i < standByListLegnth; i++) {
    if (standByList[i].userId == userInfo.userId) {
      standByList[i].startDate = new Date()
      return
    }
  }
  var matchedListLegnth = matchedList.length
  for (var i = 0; i < matchedListLegnth; i++) {
    if (matchedList[i].userId == userInfo.userId) return
  }
  userInfo.startDate = new Date()
  standByList.unshift(userInfo)
  log.info('用户开始匹配' + JSON.stringify(userInfo))
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
    if (standByList[i].userId == userId) {
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
    var speechName = getRandomSpeechName()
    matchedList.push({ userId: matchUserA.userId, matchedUser: matchUserB,roomId: roomId, speechName: speechName, startDate: new Date() })
    matchedList.push({ userId: matchUserB.userId, matchedUser: matchUserA,roomId: roomId, speechName: speechName, startDate: new Date() })
    
    // matchUserA.status = 1
    // matchUserA.audios = []
    // matchUserB.status = 1
    // matchUserB.audios = []
    //roomList.push({ roomId: roomId, userList: [matchUserA, matchUserB],speeches:[], speechName: speechName,startDate: new Date()})
    log.info('匹配成功，将匹配成功的两个用户从等待列表删除，转移到匹配成功列表' + JSON.stringify(matchUserA) + JSON.stringify(matchUserB))
  }
}

var getRandomSpeechName = () => {
  var index = Math.floor(Math.random() * speechNames.length)
  if (index-1 >= 0 && index < speechNames.length) {
    return speechNames[index-1].speech_name
  }else{
    return '第一次'
  }
}

var getMatchInfo = (userId) => {
  var length = matchedList.length
  for (var i = 0; i < length; i++) {
    if (matchedList[i].userId == userId) {
       var removedUser = matchedList.splice(i, 1)
       log.info('匹配成功，将用户从匹配成功列表删除' + JSON.stringify(removedUser))
       return removedUser[0]
    }
  }
  return 0
}

var getRoomInfo = (roomId) => {
  var length = roomList.length
  for (var i = 0; i < length; i++) {
    if (roomList[i].roomId == roomId) {
      return roomList[i]
    }
  }
  return {}
}

var giveSpeech = (roomId, userId, audioId, audioType, timeDuration) => {
  var length = roomList.length
  var userInfo
  updateUserStatus(roomId, userId)
  for (var i = 0; i < length; i++) {
    if (roomList[i].roomId == roomId) {
      if (roomList[i].userList[0].userId = userId) {
        userInfo = roomList[i].userList[0].audios.push({
          userInfo: userInfo,
          audioId: audioId,
          src: audioService.getSrc(audioId),
          audioType: audioType,
          timeDuration: timeDuration
        })
      } else {
        userInfo = roomList[i].userList[1].audios.push({
          userInfo: userInfo,
          audioId: audioId,
          src: audioService.getSrc(audioId),
          audioType: audioType,
          timeDuration: timeDuration
        })
      }
      // roomList[i].speeches.push({ 
      //   userInfo: userInfo,
      //   audioId: audioId,
      //   src: audioService.getSrc(audioId), 
      //   audioType: audioType, 
      //   timeDuration: timeDuration
      //   })

      log.info('提交录音，房间最新信息' + JSON.stringify(roomList[i]))
    }
  }
  
}

var updateUserStatus = (roomId, userId) => {
  var length = roomList.length
  for (var i = 0; i < length; i++) {
    if (roomList[i].roomId == roomId) {
      if (roomList[i].userList[0].userId = userId) {
        roomList[i].userList[0].status = roomList[i].userList[0].status + 1
      } else {
        roomList[i].userList[1].status = roomList[i].userList[0].status + 1
      }
    }
  }
  
}

initSpeechNames()
setInterval(autoMatchUser, 1 * 1000);
setInterval(initSpeechNames, 10 * 60 * 1000);

module.exports = { startMatch, stopMatch, autoMatchUser, getMatchInfo, getRoomInfo, giveSpeech, updateUserStatus }