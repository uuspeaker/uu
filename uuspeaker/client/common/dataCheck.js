var config = require('../config')

var isEmpty = function (str) {
  if (str == undefined || str == null || str.replace(/^\s+|\s+$/g, '') == ''){
    return true
  }else{
    return false
  }  
}

var isInt = function (str) {
  var reg = /^\d+$/;   
  return reg.test(str);     
}

module.exports = {
  isEmpty,
  isInt
}