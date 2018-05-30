var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var dateFormat = require('../../../common/dateFormat.js')

Page({
  data: {
    studyData: {},
    nickName:'',
    rank:'',
  },

  queryStudyData: function (e) {
    //util.showBusy('请求中...')
    var that = this
    qcloud.request({
      url: `${config.service.host}/weapp/letter.letterForLevel3`,
      login: true,
      method: 'get',
      success(result) {
        var studyData = result.data.data
        studyData.firstStudyDateStr = dateFormat.format(new Date(studyData.firstStudyDate),'yyyy年M月d日')
        studyData.firstSpeechDateStr = dateFormat.format(new Date(studyData.firstSpeechDate),'M月d日')
        studyData.days = dateFormat.getBetweenDays(studyData.firstStudyDate)
        studyData.partnerNames = that.getPartnerNames(studyData.studyPartner)
        that.setData({
          studyData: studyData
        })

        console.log(result.data.data)
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  getPartnerNames: function(allPartners){
    console.log(allPartners)
    var partnerName = ''
    for (var i = 0; i<allPartners.length; i++){
      if (partnerName == ''){
        partnerName = allPartners[i].user_info.nickName
      }else{
        partnerName = partnerName + '，' + allPartners[i].user_info.nickName
      }
      if(i >= 5)break
    }
    return partnerName
  },


  onLoad: function (options) {
    this.queryStudyData()
    this.setData({
      nickName: options.nickName,
      rank: options.rank
    })
  },

});