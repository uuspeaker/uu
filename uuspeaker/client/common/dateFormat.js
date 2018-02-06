var format = (date, fmt) => {
  Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }
  return date.format(fmt)
}

var getTimeNotice= function(noticeDate) {
  var now = new Date()
  var targetDate = new Date(noticeDate)
  var day = Math.floor((now - targetDate) / (24 * 60 * 60 * 1000))
  var hour = Math.floor((now - targetDate) / (60 * 60 * 1000))
  var min = Math.floor((now - targetDate) / (60 * 1000))
  if (min <= 1) {
    return '刚才'
  } else if (min < 60) {
    return min + '分钟前'
  } else if (hour >= 1 && hour < 24) {
    return hour + '小时前'
  } else if (day >= 1 && day < 7) {
    return day + '天前'
  } else {
    return dateFormat.format(noticeDate, 'yyyy年MM月dd日 hh:mi')
  }
}

var getTimeNoticeFuture = function (noticeDate) {
  var now = new Date()
  var nowStr = dateFormat.format(now, 'yyyyMMdd')
  var targetDate = new Date(noticeDate)
  targetDateStr = dateFormat.format(now, 'targetDate')
  if (nowStr == targetDateStr) {
    return '今天'
  } else {
    return dateFormat.format(noticeDate, 'yyyy年MM月dd日')
  }
}

module.exports = { format, getTimeNotice, getTimeNoticeFuture}
