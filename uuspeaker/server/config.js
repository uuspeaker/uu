const CONF = {
    port: '5757',
    rootPathname: '',

    // 微信小程序 App ID
    appId: 'wxef60ee565b6fa65f',

    // 微信小程序 App Secret
    appSecret: 'cf3b448c2afd8f1426327c0f8992962c',

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
    // live: {
    //   appID: 1400063484,
    //   bizid:1,
    //   pushSecretKey:1,
    //   APIKey:1,
    //   validTime:3600*24*7
    // },

    //云通信相关配置
    // im: {
    //   sdkAppID: 1400063484,
    //   accountType: 21916,
    //   administrator: 'tianhan',
    //   privateKey: '-----BEGIN PRIVATE KEY-----\r\n' +
    //   'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgGjEGt3r1oaS1Xqn4\r\n' +
    //   'hEkCcQBQH3jgPhsYknEZe7pTzEChRANCAARHLhPg09JRyNdAXvfMKUw+Le3DFEn7\r\n' +
    //   'CHfkVP4LM+3k+tY3HxjRiX5+YTwj4wtPoIpJZ0JAOIRachTEBOeNRwNp\r\n' +
    //   '-----END PRIVATE KEY-----\r\n'
    // },

    cos: {
        /**
         * 地区简称
         * @查看 https://cloud.tencent.com/document/product/436/6224
         */
        region: 'ap-guangzhou',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 7200,
    wxMessageToken: 'abcdefgh'
}

module.exports = CONF
