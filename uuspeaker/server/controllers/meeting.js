const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
      user: 'root',
        password: 'killing.928',
          database: 'uuspeaker'
});

/**
 * 获取会议报名情况
 */
async function getApplyInfo (ctx, next) {
  connection.connect();

  connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
  });
}

module.exports = ctx => { 
  ctx.state.data = {
    msg: 'Hello World',
    getApplyInfo: getApplyInfo
  }
}