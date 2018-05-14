var config = require('../config')
var qcloud = require('../vendor/wafer2-client-sdk/index')

var updatePlayDuration = (playDuration) =>{
  qcloud.request({
    url: `${config.service.host}/weapp/audio.playAudio`,
    login: true,
    data: { playDuration: playDuration },
    method: 'post',
    success(result) {

    },
    fail(error) {
      util.showModel('请求失败', error);
      console.log('request fail', error);
    }
  })
}

module.exports = { updatePlayDuration }