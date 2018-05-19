var config = require('../config')
var qcloud = require('../vendor/wafer2-client-sdk/index')

var playData = ''
var coinSrc = 'https://lg-oztvih8q-1255679565.cos.ap-shanghai.myqcloud.com/coin.mp3'

var updatePlayDuration = (playDuration) =>{
  var that = this
  if (playData != ''){
    var duration = new Date() - playData
    if(duration < 10000)return
  }
  //showScoreNoitce()
  playData = new Date()
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

module.exports = { updatePlayDuration, coinSrc }