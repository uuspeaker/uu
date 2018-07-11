/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://gytr1z9p.qcloud.la';
// var host = 'https://734232337.uuspeaker.com';

var config = {
  // url: 'https://gytr1z9p.qcloud.la',
  //url: 'https://734232337.uuspeaker.com',

  // 下面的地址配合云端 Demo 工作
  service: {
    host,

    // 登录地址，用于建立会话
    loginUrl: `${host}/weapp/login`,

    // 测试的请求地址，用于测试会话
    requestUrl: `${host}/weapp/user`,

    // 测试的信道服务地址
    tunnelUrl: `${host}/weapp/tunnel`,

    // 测试的信道服务地址
    chatUrl: `${host}/weapp/impromptu.chatUrl`,

    // 上传图片接口
    voiceUrl: `${host}/weapp/recognize`
  },

  options : {
    duration: 600000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 51200,
    format: 'mp3',
    frameSize:50
  },
};

module.exports = config;
