const CONF = {
  port: '5757',
  rootPathname: '',

  // 微信小程序 App ID
  appId: 'wx43906d390cba4987',

  // 微信小程序 App Secret
  appSecret: 'a9135db0ad26aed53152728a04a96525',

  qcloudAppId: '1255773188',
  qcloudSecretId: 'AKIDCcKCVdh9kQBqbhML3307HfZJA8WL36hj',
  qcloudSecretKey: 'oTzYBIIU2OaG74zBFmhSRTihp0Nshcfq',

  // 是否使用腾讯云代理登录小程序
  useQcloudLogin: true,

  /**
   * MySQL 配置，用来存储 session 和用户信息
   * 若使用了腾讯云微信小程序解决方案
   * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
   */
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    db: 'cAuth',
    pass: 'killing.928',
    char: 'utf8mb4'
  },

  //云直播相关配置
  live: {
    appID: 1255773188,
    bizid: 20363,
    pushSecretKey: '4a43a87b03e6085a44e76705a9d02686',
    APIKey: '0b8414ceddf4a196d1b6f7ff273b9b80',
    validTime: 3600 * 24 * 7
  },

  //云通信相关配置
  im: {
    sdkAppID: 1400088823,
    accountType: '26033',
    administrator: 'tianhan',
    privateKey: '-----BEGIN PRIVATE KEY-----\r\n' +
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgehABiitYS8cqVHFy\r\n' +
    'czbsv4910C8N8hQtmk+yk8/vvxyhRANCAAT3g545whuAXWQVGBQ20UxM9MREjVin\r\n' +
    'pqwfo6c6E8ZlZe7uepkZYI1o7FJyCXtR/Llz6aFykXwBash0KYb3vRCh\r\n' +
    '-----END PRIVATE KEY-----\r\n'
  },

  cos: {
    /**
     * 地区简称
     * @查看 https://cloud.tencent.com/document/product/436/6224
     */
    region: 'ap-guangzhou',
    // Bucket 名称
    fileBucket: 'uuspeaker',
    // 文件夹
    uploadFolder: 'audio',
    maxSize: 20
  },

  /**
 * 多人音视频房间相关参数
 */
  multi_room: {
    // 房间容量上限
    maxMembers: 9,

    // 心跳超时 单位秒
    heartBeatTimeout: 20,

    // 空闲房间超时 房间创建后一直没有人进入，超过给定时间将会被后台回收，单位秒
    maxIdleDuration: 30
  },

  /**
 * 辅助功能 后台日志文件获取相关 当前后台服务的访问域名。
 */
  selfHost: "https://drourwkp.qcloud.la",

  // 微信登录态有效期
  wxLoginExpires: 7200,
  wxMessageToken: 'abcdefgh'
}

module.exports = CONF
