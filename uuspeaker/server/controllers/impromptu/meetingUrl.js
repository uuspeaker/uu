const { tunnel } = require('../../qcloud')
const { mysql } = require('../../qcloud')
const uuid = require('../../common/uuid.js')
const log = require('../../log');
const audioService = require('../../service/audioService.js')
const userInfoService = require('../../service/userInfoService')
const speechService = require('../../service/speechService')

const option = {
  MAX_NUMBER_TUNNEL_RESEND: 3,//每个信道允许出现无效信道时重新发送的次数
}

/**
 * 这里实现一个简单的聊天室
 * meetingUserMap 为 tunnelId 和 用户信息的映射
 * 实际使用请使用数据库存储
 */
var meetingUserMap = {}
//var sperkers = {}

// 保存 当前已连接的 WebSocket 信道ID列表
const meetingConnectedTunnelIds = []

var waitTime = 99000
var unactiveTime = 10 * 60 * 1000
var standByList = []
// var speechNames = []
var numberTunnelResend = []

// var initSpeechNames = async () => {
//   speechNames = await mysql("speech_name_info").select('speech_name')
// }

// var getRandomSpeechName = () => {
//   var index = Math.floor(Math.random() * speechNames.length)
//   if (index - 1 >= 0 && index < speechNames.length) {
//     return speechNames[index - 1].speech_name
//   } else {
//     return '第一次'
//   }
// }

var startMatch = (userInfo) => {
  var standByListLegnth = standByList.length
  for (var i = 0; i < standByListLegnth; i++) {
    if (standByList[i].userId == userInfo.userId) {
      standByList[i].startDate = new Date()
      return
    }
  }

  userInfo.startDate = new Date()
  standByList.unshift(userInfo)
  setUserStatus(userInfo.userId,1)
  //meetingUserMap[sperkers[userInfo.userId][tunnelId]].speechStatus = 1
  $broadcast('people', {
    'updatedPerson': getUserInfo(userInfo.userId)
  })
  log.info('用户开始匹配' + JSON.stringify(userInfo))
  log.info('当前正在等待匹配的所有用户' + JSON.stringify(standByList))
}

var setUserStatus = (userId, status) => {
  for (i in meetingUserMap){
    if (meetingUserMap[i].openId == userId){
      meetingUserMap[i].speechStatus = status
    }
  }
}

var getUserInfo = (userId) => {
  for (i in meetingUserMap) {
    if (meetingUserMap[i].openId == userId) {
      return meetingUserMap[i]
    }
  }
  return {}
}

var getTunnelId = (userId) => {
  for (i in meetingUserMap) {
    if (meetingUserMap[i].openId == userId) {
      return meetingUserMap[i].tunnelId
    }
  }
  return ''
}

//定期删除超过最大时间还未匹配到的用户
var removeUnmatchUser = () => {
  var now = new Date()
  var standByListLegnth = standByList.length
  var removeAmount = 0
  for (var i = 0; i < standByListLegnth; i++) {
    var lastSeconds = Math.floor(now - standByList[i].startDate)
    if (lastSeconds >= waitTime) {
      var removedUser = standByList.splice(i - removeAmount, 1)[0]

      setUserStatus( removedUser.userId, 0)
      log.info('当前用户' +JSON.stringify(meetingUserMap))
        $broadcast('people', {
          'updatedPerson': getUserInfo(removedUser.userId)
        })
      
      log.info('等待时间到还未匹配到，将用户从等待列表删除' + JSON.stringify(removedUser))
      log.info('当前正在等待匹配的所有用户' + JSON.stringify(standByList))
      removeAmount++
    }
  }
}

//定期删除超过最大时间还未匹配到的用户
var clearUnactiveUser = () => {
  var now = new Date()
  var legnth = meetingUserMap.length
  var removeAmount = 0
  for (var i in meetingUserMap) {
    var lastSeconds = Math.floor(now - meetingUserMap[i].updateTime)
    if (lastSeconds >= unactiveTime) {
      log.info('清除不活动用户' + JSON.stringify(meetingUserMap[i]))
      onClose(meetingUserMap[i].tunnelId)
    }
  }
}



//用户停止匹配
var stopMatch = (userId) => {
  var standByListLegnth = standByList.length
  var removeAmount = 0
  for (var i = 0; i < standByListLegnth; i++) {
    log.info('用户取消循环' + i + ':' + JSON.stringify(standByList[i]))
    if (standByList[i].userId == userId) {
      var removedUser = standByList.splice(i, 1)
        setUserStatus(userId, 0)
        $broadcast('people', {
          'updatedPerson': getUserInfo(userId)
        })
      
      log.info('用户取消匹配' + JSON.stringify(removedUser))
      log.info('当前正在等待匹配的所有用户' + JSON.stringify(standByList))
      return
    }
  }
}

var autoMatchUser = () => {
  removeUnmatchUser()
  //removeMatchUser()
  var matchTimes = Math.floor(standByList.length / 2)
  for (var i = 0; i < matchTimes; i++) {
    var roomId = uuid.v1()
    var matchUserA = standByList.pop()
    var matchUserB = standByList.pop()
    var speechName = speechService.getRandomSpeechName()

    log.info('匹配成功，将匹配成功的两个用户从等待列表删除，转移到匹配成功列表' + JSON.stringify(matchUserA) + JSON.stringify(matchUserB))

    $sendMessage(getTunnelId(matchUserA.userId), 'match', {
      'data': { matchedUser: matchUserB, speechName: speechName}
    })
    
    $sendMessage(getTunnelId(matchUserB.userId), 'match', {
      'data': { matchedUser: matchUserA, speechName: speechName}
    })

  }
}

/**
 * 调用 tunnel.broadcast() 进行广播
 * @param  {String} type    消息类型
 * @param  {String} content 消息内容
 */
const doSendMessage = (tunnelIds,type, content) => {
  tunnel.broadcast(tunnelIds, type, content)
    .then(result => {
      const invalidTunnelIds = result.data && result.data.invalidTunnelIds || []

      if (invalidTunnelIds.length) {
        console.log('检测到无效的信道 IDs =>', invalidTunnelIds)

        // 从 meetingUserMap 和 meetingConnectedTunnelIds 中将无效的信道记录移除
        invalidTunnelIds.forEach(tunnelId => {
          let number = numberTunnelResend[tunnelId] ? numberTunnelResend[tunnelId] : 0
          if (number < option.MAX_NUMBER_TUNNEL_RESEND) {//当发送次数不大于规定次数时，可以进行重发
            let timer = setTimeout(() => {
              numberTunnelResend[tunnelId] = ++number
              $sendMessage([tunnelId], type, content)
              clearTimeout(timer)
            }, 3000)
          } else {
            //onClose(tunnelId)
          }
        })
      }
    })
}
const $broadcast = (type, content) => {
  doSendMessage(meetingConnectedTunnelIds, type, content)
}

const $sendMessage = (targetTunnelId, type, content) => {
  doSendMessage([targetTunnelId], type, content)
}

/**
 * 调用 TunnelService.closeTunnel() 关闭信道
 * @param  {String} tunnelId 信道ID
 */
const $close = (tunnelId) => {
  tunnel.closeTunnel(tunnelId)
}

/**
 * 实现 onConnect 方法
 * 在客户端成功连接 WebSocket 信道服务之后会调用该方法，
 * 此时通知所有其它在线的用户当前总人数以及刚加入的用户是谁
 */
function onConnect(tunnelId) {
  console.log(`[meetingUrl onConnect] =>`, tunnelId )
  console.log(meetingUserMap)
  if (tunnelId in meetingUserMap) {
    meetingConnectedTunnelIds.push(tunnelId)

    $sendMessage(tunnelId, 'userList', {
      'data': meetingUserMap
    })

    $broadcast('people', {
      'enter': meetingUserMap[tunnelId]
    })
  } else {
    console.log(`meetingUrl Unknown tunnelId(${tunnelId}) was connectd, close it`)
    $close(tunnelId)
  }
}

/**
 * 实现 onMessage 方法
 * 客户端推送消息到 WebSocket 信道服务器上后，会调用该方法，此时可以处理信道的消息。
 * 在本示例，我们处理 `speak` 类型的消息，该消息表示有用户发言。
 * 我们把这个发言的信息广播到所有在线的 WebSocket 信道上
 */
function onMessage(tunnelId, type, content) {
  console.log(`[meetingUrl onMessage] =>`, { tunnelId, type, content })

  switch (type) {
    case 'speak':
      if (tunnelId in meetingUserMap) {
        meetingUserMap[tunnelId].updateTime = new Date()
        $broadcast('speak', {
          'who': meetingUserMap[tunnelId],
          'word': content.word
        })
      } else {
        $close(tunnelId)
      }
      break
    case 'speech':
      if (tunnelId in meetingUserMap) {
        meetingUserMap[tunnelId].updateTime = new Date()
        $sendMessage(getTunnelId(content.targetUserId), 'speech', {
          'who': meetingUserMap[tunnelId],
          'data': content
        })
      } else {
        $close(tunnelId)
      }
      break
    default:
      break
  }
}

/**
 * 实现 onClose 方法
 * 客户端关闭 WebSocket 信道或者被信道服务器判断为已断开后，
 * 会调用该方法，此时可以进行清理及通知操作
 */
function onClose(tunnelId) {
  console.log(`[meetingUrl onClose] =>`, { tunnelId })

  if (!(tunnelId in meetingUserMap)) {
    console.log(`[meetingUrl onClose][Invalid TunnelId]=>`, tunnelId)
    $close(tunnelId)
    return
  }

  //delete sperkers[meetingUserMap[tunnelId].openId]

  const leaveUser = meetingUserMap[tunnelId]
  delete meetingUserMap[tunnelId]

  const index = meetingConnectedTunnelIds.indexOf(tunnelId)
  if (~index) {
    meetingConnectedTunnelIds.splice(index, 1)
  }

  // 聊天室没有人了（即无信道ID）不再需要广播消息
  if (meetingConnectedTunnelIds.length > 0) {
    $broadcast('people', {
      'total': meetingConnectedTunnelIds.length,
      'leave': leaveUser
    })
  }
}

function resetNumberOfResend(){
  numberTunnelResend = []
}

module.exports = {
  // 小程序请求 websocket 地址
  get: async ctx => {
    const data = await tunnel.getTunnelUrl(ctx.req)
    console.log('init matchUrl', data)
    const tunnelInfo = data.tunnel
    data.userinfo.rank = ctx.query.rank
    data.userinfo.tunnelId = tunnelInfo.tunnelId
    data.userinfo.speechStatus = ctx.query.speechStatus
    data.userinfo.updateTime = new Date()
    
    //清除原先打开的信道
    // if (data.userinfo.openId in sperkers){
    //   var oldTunnelId = sperkers[data.userinfo.openId][tunnelId]
    //   onClose(oldTunnelId)
    // }
    for (i in meetingUserMap){
      if (meetingUserMap[i].openId == data.userinfo.openId) {
        onClose(meetingUserMap[i].tunnelId)
      }
    }
    
    meetingUserMap[tunnelInfo.tunnelId] = data.userinfo
    //sperkers[data.userinfo.openId] = { 'tunnelId': tunnelInfo.tunnelId,'updateTime':new Date()}
    //console.log('meetingUrl meetingUserMap', meetingUserMap)
    ctx.state.data = tunnelInfo
  },

  // 小程序请求 websocket 地址
  put: async ctx => {
    var matchType = ctx.request.body.matchType
    console.log('matchType', matchType)
      if (matchType == 'startMatch'){
        var userInfo = await userInfoService.getUserInfoByKey(ctx)
        startMatch(userInfo)
      } else if (matchType == 'stopMatch'){
        var userId = await userInfoService.getOpenId(ctx)
        stopMatch(userId)
      }

  },


  // 信道将信息传输过来的时候
  post: async ctx => {
    const packet = await tunnel.onTunnelMessage(ctx.request.body)

    console.log('meetingUrl Tunnel recive a package: %o', packet)

    switch (packet.type) {
      case 'connect':
        onConnect(packet.tunnelId)
        break
      case 'message':
        onMessage(packet.tunnelId, packet.content.messageType, packet.content.messageContent)
        break
      case 'close':
        onClose(packet.tunnelId)
        break
    }
  }

}

// initSpeechNames()
setInterval(autoMatchUser, 1 * 1000);
// setInterval(initSpeechNames, 10 * 60 * 1000);
setInterval(resetNumberOfResend, 10 * 60 * 1000);
setInterval(clearUnactiveUser, 60 * 1000);
