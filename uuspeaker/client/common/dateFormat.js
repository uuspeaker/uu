var that = this
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

var getSimpleFormatDate = function (noticeDate) {
  var now =  new Date()
  var targetDate = new Date(noticeDate)
  if(now.getFullYear() == targetDate.getFullYear()){
    return this.format(targetDate, 'M月d日 hh:mm')
  }else{
    return this.format(targetDate, 'yyyy年M月d日 hh:mm')
  }

}

var getTimeNotice = function (noticeDate) {
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
    if (now.getFullYear() == targetDate.getFullYear()) {
      return this.format(targetDate, 'M月d日 hh:mm')
    }else{
      return this.format(targetDate, 'yyyy年M月d日 hh:mm')
    }
    
  }
}

var getTimeNoticeFuture = function (noticeDate) {
  var now = new Date()
  now.setHours(0)
  now.setMinutes(0)
  now.setSeconds(0)
  now.setMilliseconds(0)
  var targetDate = new Date(noticeDate)
  var time = this.format(targetDate,'hh:mm')
  targetDate.setHours(0)
  targetDate.setMinutes(0)
  targetDate.setSeconds(0)
  targetDate.setMilliseconds(0)
  var between = (targetDate - now) / (24 * 60 * 60 * 1000)
  if (between == 0) {
    return '今天' + ' ' + time + '（' + this.getWeek(noticeDate) + ')'
  } else if (between == 1) {
    return '明天' + ' ' + time + '（' + this.getWeek(noticeDate) + ')'
  } else if (between == 2) {
    return '后天' + ' ' + time + '（' + this.getWeek(noticeDate) + ')'
  } else {
    if (now.getFullYear() == targetDate.getFullYear()){
      return this.format(targetDate, 'M月d日 ') + time + '（' + this.getWeek(noticeDate) + ') ' 
    }else{
      return this.format(targetDate, 'yyyy年M月d日 ') + time + '（' + this.getWeek(noticeDate) + ') ' 
    }
  }
}

var getTimeStatus = function (startDateStr, endDateStr) {
  var now = new Date()
  var startDate = new Date(startDateStr)
  var endDate = new Date(endDateStr)

  if (now < startDate) {
    return 1
  } else if (now > endDate) {
    return 3
  } else {
    return 2
  }
}

var getWeek = function(date) {
  var dateString = this.format(new Date(date),'yyyy-MM-dd')
  var date;
  if (dateString == null || typeof dateString == "undefined") {
    date = new Date();
  } else {
    var dateArray = dateString.split("-");
    date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
  }
  //var weeks = new Array("日", "一", "二", "三", "四", "五", "六");
  //return "星期" + weeks[date.getDay()];
  return "星期" + "日一二三四五六".charAt(date.getDay());
}

var getFormatDuration = function (timeDuration) {
  var hour = Math.floor(timeDuration / (60 * 60))
  var minute = Math.floor(timeDuration / 60)
  var second = Math.floor(timeDuration % 60)
  var durationStr = ''
  if (hour != 0){
    durationStr = durationStr + hour + '小时'
  }
  if (minute != 0) {
    durationStr = durationStr + minute + '分'
  }
  if (second != 0) {
    durationStr = durationStr + second + '秒'
  }
  return durationStr
}

var getFormatDuration2 = function (timeDuration) {
  var hour = Math.floor(timeDuration / (60 * 60))
  var minute = Math.floor(timeDuration / 60)
  var second = Math.floor(timeDuration % 60)
  var durationStr = ''
  if (hour != 0) {
    return durationStr + hour + ' 小时'
  }
  if (minute != 0) {
    return durationStr + minute + ' 分钟'
  }
  if (second != 0) {
    return durationStr + second + ' 秒'
  }
}

module.exports = { format, getTimeNotice, getTimeNoticeFuture, getWeek, getTimeStatus, getSimpleFormatDate, getFormatDuration, getFormatDuration2}
