const debug = require('debug')('koa-weapp-demo')
const dateUtil = require('../common/dateUtil');
const log = require('../log');
/**
 * 响应处理模块
 */
module.exports = async function (ctx, next) {
  var start = new Date()
    try {
      global.log = {}
      var input = ''
      if (ctx.method == 'GET') {
        input = ctx.query
      } else {
        input = ctx.request.body
      }

      //global.log.time = dateUtil.format(new Date(), 'yyyyMMdd h:m:s.S')
      global.log.url = ctx.originalUrl 
      global.log.method = ctx.method
      global.log.user = ctx.header['x-wx-skey']
        // 调用下一个 middleware
      await next()
        
        
        
        // 处理响应结果
        // 如果直接写入在 body 中，则不作处理
        // 如果写在 ctx.body 为空，则使用 state 作为响应
        ctx.body = ctx.body ? ctx.body : {
            code: ctx.state.code !== undefined ? ctx.state.code : 0,
            data: ctx.state.data !== undefined ? ctx.state.data : {}
        }
        var end = new Date()
        var time = end - start
        global.log.spend = time
        if(time >= 10000) {
          global.log.overTime = 'overTime10 ' + ctx.originalUrl
        } else if (time >= 5000) {
          global.log.overTime = 'overTime5 ' + ctx.originalUrl
        } else if (time >= 2000) {
          global.log.overTime = 'overTime2 ' + ctx.originalUrl
        } if (time >= 1000) {
          global.log.overTime ='overTime1 ' + ctx.originalUrl
        }else{
          global.log.overTime = 'overTime0 ' + ctx.originalUrl
        }
        global.log.input = input 
        global.log.output = ctx.state.data
        log.info(JSON.stringify(global.log))
    } catch (e) {
      global.log.error = e
      log.warn(JSON.stringify(global.log))
        // catch 住全局的错误信息
        debug('Catch Error: %o', e)

        // 设置状态码为 200 - 服务端错误
        ctx.status = 200

        // 输出详细的错误信息
        ctx.body = {
            code: -1,
            error: e && e.message ? e.message : e.toString()
        }
    }
}
