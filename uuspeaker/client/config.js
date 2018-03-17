/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://r3uhpu7v.qcloud.la';

var config = {
  // url: 'https://lvb.qcloud.com',
  url: 'https://r3uhpu7v.qcloud.la',

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        voiceUrl: `${host}/weapp/recognize`
    }
};

module.exports = config;
