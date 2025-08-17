const taskhistoryRoutes = require("../routes/taskhistory.routes.js");
const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}
//....................................... create taskhistory.........................................
async function create(newtaskhistory, userid){
  console.log('.... create taskhistory.....');
  console.log('userid==' , userid)
  delete newtaskhistory.id;
//   id, taskid, name, description, field, oldvalue, newvalue, createdbyid, createddate
  const result = await sql.query(`INSERT INTO ${this.schema}.taskhistory (taskid, name, description, field, oldvalue, newvalue, createdbyid)  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, 
  [newtaskhistory.taskid, newtaskhistory.name, newtaskhistory.description, newtaskhistory.field, newtaskhistory.oldvalue, newtaskhistory.newvalue, userid]);
  if(result.rows.length > 0){
    return { id: result.rows[0].id, ...newtaskhistory};
  }

  return null;

};

  async function findTaskHistory(id) {
    console.log("id ", id);
    let query = `SELECT th.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname FROM ${this.schema}.taskhistory th`;
    query += " LEFT JOIN public.user cu ON cu.Id = th.createdbyid ";
    const result = await sql.query(query + ` WHERE th.taskid = $1`,[id]);
    // const result = await sql.query(`SELECT * FROM ${this.schema}.taskhistory WHERE taskid = $1 ORDER BY createddate DESC`,[id]);
    console.log("Rows ", result.rows);
    if(result.rows.length > 0)
      return result.rows;
  
  return null;
};



module.exports = {init, create, findTaskHistory};