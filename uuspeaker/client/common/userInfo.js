var that = this
var getRank = (studyMinites) => {
  var studyHours = Math.floor(studyMinites/60)
  var rank = ''
  if (studyHours == 0){
    rank = 'Lv1：乞丐演讲君'
  } else if (studyHours >= Math.pow(2, 0) && studyHours < Math.pow(2, 1)){
    rank = 'Lv2：贫民演讲君'
  } else if (studyHours >= Math.pow(2, 1) && studyHours < Math.pow(2, 2)){
    rank = 'Lv3：布衣演讲君'
  } else if (studyHours >= Math.pow(2, 2) && studyHours < Math.pow(2, 3)){
    rank = 'Lv4：青铜演讲君'
  } else if (studyHours >= Math.pow(2, 3) && studyHours < Math.pow(2, 4)){
    rank = 'Lv5：白银演讲君'
  } else if (studyHours >= Math.pow(2, 4) && studyHours < Math.pow(2, 5)){
    rank = 'Lv6：黄金演讲君'
  } else if (studyHours >= Math.pow(2, 5) && studyHours < Math.pow(2, 6)){
    rank = 'Lv7：铂金演讲君'
  } else if (studyHours >= Math.pow(2, 6) && studyHours < Math.pow(2, 7)){
    rank = 'Lv8：钻石演讲君'
  } else if (studyHours >= Math.pow(2, 7) && studyHours < Math.pow(2, 8)){
    rank = 'Lv9：星耀演讲君'
  } else if (studyHours >= Math.pow(2, 8) && studyHours < Math.pow(2, 9)){
    rank = 'Lv10：王者演讲君'
  }
  return rank
}

module.exports = { getRank}
