const { tunnel } = require('../../qcloud')

/**
 * 这里实现一个简单的聊天室
 * chatUserMap 为 tunnelId 和 用户信息的映射
 * 实际使用请使用数据库存储
 */
var chatUserMap = {}

// 保存 当前已连接的 WebSocket 信道ID列表
var chatConnectedTunnelIds = []

/**
 * 调用 tunnel.broadcast() 进行广播
 * @param  {String} type    消息类型
 * @param  {String} content 消息内容
 */
const $broadcast = (type, content) => {
  tunnel.broadcast(chatConnectedTunnelIds, type, content)
    .then(result => {
      const invalidTunnelIds = result.data && result.data.invalidTunnelIds || []

      if (invalidTunnelIds.length) {
        console.log('检测到无效的信道 IDs =>', invalidTunnelIds)

        // 从 chatUserMap 和 chatConnectedTunnelIds 中将无效的信道记录移除
        invalidTunnelIds.forEach(tunnelId => {
          delete chatUserMap[tunnelId]

          const index = chatConnectedTunnelIds.indexOf(tunnelId)
          if (~index) {
            chatConnectedTunnelIds.splice(index, 1)
          }
        })
      }
    })
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
  console.log(`[chatUrl onConnect] =>`, { tunnelId })

  if (tunnelId in chatUserMap) {
    chatConnectedTunnelIds.push(tunnelId)

    $broadcast('people', {
      'total': chatConnectedTunnelIds.length,
      'enter': chatUserMap[tunnelId]
    })
  } else {
    console.log(`chatUrl Unknown tunnelId(${tunnelId}) was connectd, close it`)
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
  console.log(`[onMessage] =>`, { tunnelId, type, content })

  switch (type) {
    case 'speak':
      if (tunnelId in chatUserMap) {
        $broadcast('speak', {
          'who': chatUserMap[tunnelId],
          'word': content.word
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
  console.log(`[chatUrl onClose] =>`, { tunnelId })

  if (!(tunnelId in chatUserMap)) {
    console.log(`[chatUrl onClose][Invalid TunnelId]=>`, tunnelId)
    $close(tunnelId)
    return
  }

  const leaveUser = chatUserMap[tunnelId]
  delete chatUserMap[tunnelId]

  const index = chatConnectedTunnelIds.indexOf(tunnelId)
  if (~index) {
    chatConnectedTunnelIds.splice(index, 1)
  }

  // 聊天室没有人了（即无信道ID）不再需要广播消息
  if (chatConnectedTunnelIds.length > 0) {
    $broadcast('people', {
      'total': chatConnectedTunnelIds.length,
      'leave': leaveUser
    })
  }
}

module.exports = {
  // 小程序请求 websocket 地址
  get: async ctx => {
    const data = await tunnel.getTunnelUrl(ctx.req)
    const tunnelInfo = data.tunnel

    chatUserMap[tunnelInfo.tunnelId] = data.userinfo
    console.log('chatUrl chatUserMap', chatUserMap)
    ctx.state.data = tunnelInfo
  },

  // 信道将信息传输过来的时候
  post: async ctx => {
    const packet = await tunnel.onTunnelMessage(ctx.request.body)

    console.log('chatUrl Tunnel recive a package: %o', packet)

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
