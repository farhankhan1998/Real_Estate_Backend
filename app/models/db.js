const dbConfig = require("../config/db.config.js");
const pg = require('pg')
const Pool = pg.Pool

pg.types.setTypeParser(1114, function(stringValue) {
  return stringValue;  //1114 for time without timezone type
});

pg.types.setTypeParser(1082, function(stringValue) {
  return stringValue;  //1082 for date type
});

const connection = new Pool({
  user: dbConfig.USER,
  host: dbConfig.HOST,
  database: dbConfig.DB,
  password: dbConfig.PASSWORD,
  port: 5432,
})
module.exports = connection;
