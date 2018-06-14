var that = this
var getRank = (studySeconds) => {
  var studyHours = studySeconds/3600
  var rank = ''
  if (studyHours == 0){
    rank = 'Lv1：乞丐演讲君'
  } else if (studyHours > 0 && studyHours < Math.pow(2, 0)){
    rank = 'Lv2：布衣演讲君'
  } else if (studyHours >= Math.pow(2, 0) && studyHours < Math.pow(2, 1)){
    rank = 'Lv3：灰铁演讲君'
  } else if (studyHours >= Math.pow(2, 1) && studyHours < Math.pow(2, 2)){
    rank = 'Lv4：青铜演讲君'
  } else if (studyHours >= Math.pow(2, 2) && studyHours < Math.pow(2, 3)){
    rank = 'Lv5：白银演讲君'
  } else if (studyHours >= Math.pow(2, 3) && studyHours < Math.pow(2, 4)){
    rank = 'Lv6：黄金演讲君'
  } else if (studyHours >= Math.pow(2, 4) && studyHours < Math.pow(2, 5)){
    rank = 'Lv7：铂金演讲君'
  } else if (studyHours >= Math.pow(2, 5) && studyHours < Math.pow(2, 6)){
    rank = 'Lv8：钻石演讲君'
  } else if (studyHours >= Math.pow(2, 6) && studyHours < Math.pow(2, 7)){
    rank = 'Lv9：星耀演讲君'
  } else if (studyHours >= Math.pow(2, 7)){
    rank = 'Lv10：王者演讲君'
  }
  return rank
}

var getRole = (roleType) => {
  var role = ''
  if (roleType == 1) {
    role = '会长'
  } else if (roleType == 2) {
    role = '教育副会长'
  } else if (roleType == 3) {
    role = '宣传副会长'
  } else if (roleType == 4) {
    role = '会员副会长'
  } else if (roleType == 9) {
    role = '会员'
  } 
  return role
}


module.exports = { getRank,getRole}
