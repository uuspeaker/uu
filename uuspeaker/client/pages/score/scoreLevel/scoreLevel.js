var qcloud = require('../../../vendor/wafer2-client-sdk/index')
var config = require('../../../config')
var util = require('../../../utils/util.js')
var userInfo = require('../../../common/userInfo.js')

var scoreLevel = [0, 1, 60, 120, 240, 480, 960, 1920, 3840, 7680, 7680]
Page({

  /**
   * 页面的初始数据
   */
  data: {
  taskScore:0,
  taskPercent: 0,
  studyScore:'',
  rank:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      studyScore : options.totalStudyDuration,
      rank: options.rank,
    })
    //this.getNext(options.totalStudyDuration)
    var studyScore = options.totalStudyDuration
    var currentLevel = 1
    for (var i = 0; i < scoreLevel.length; i++) {
      if (studyScore >= scoreLevel[i]) {
        currentLevel = i + 1
      }
    }
    var nextLevel = currentLevel + 1
    var taskPercent = Math.floor((studyScore - scoreLevel[currentLevel - 1]) * 100 / scoreLevel[nextLevel - 1] - scoreLevel[currentLevel - 1])
    this.setData({
      taskScore: scoreLevel[nextLevel - 1] - studyScore,
      taskPercent: Math.floor((studyScore - scoreLevel[currentLevel - 1]) * 100 / (scoreLevel[nextLevel - 1] - scoreLevel[currentLevel - 1]))
    })
  
  },

 
})