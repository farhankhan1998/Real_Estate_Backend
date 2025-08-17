const taskRoutes = require("../routes/task.routes.js");
const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}
//....................................... create Task.........................................
async function create(newTask, userid) {
  console.log(".... create Task.....");
  console.log("userid==", userid);
  delete newTask.id;
  console.log("newTask :>> ", newTask);
  const result = await sql.query(
    `INSERT INTO ${this.schema}.task (title, priority, status, type, description, parentid, ownerid, targetdate,  createdbyid, lastmodifiedbyid, startdatetime, enddatetime, parenttype)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [
      newTask.title,
      newTask.priority,
      newTask.status,
      newTask.type,
      newTask.description,
      newTask.parentid,
      newTask.ownerid,
      newTask.targetdate,
      userid,
      userid,
      newTask.startdatetime,
      newTask.enddatetime,
      newTask.parenttype,

    ]
  );
  if (result.rows.length > 0) {
    return { id: result.rows[0].id, ...newTask };
  }

  return null;
}


async function findParentTypeLead() {
  let query = `SELECT t.*, concat(ld.firstname, ' ' , ld.lastname) leadname, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.task t`;
  query += " LEFT JOIN public.user cu ON cu.Id = t.createdbyid ";
  query += " LEFT JOIN public.user mu ON mu.Id = t.lastmodifiedbyid ";
   //query += " LEFT JOIN " + this.schema + ".lead ld ON ld.Id = t.parentid ";
   query += ` LEFT JOIN ${this.schema}.lead ld  ON ld.Id = t.parentid `;
 
  console.log('query *==>',query)

  //const result = await sql.query(query);
   const result = await sql.query(query + ` WHERE parenttype = 'lead'`);
  console.log("Rows ", result.rows);
  if (result.rows.length > 0) return result.rows;

  return null;
}

//.....................................find Task by id........................................
async function findById(id) {
  console.log("id ", id);
  let query = `SELECT t.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.task t`;
  query += " LEFT JOIN public.user cu ON cu.Id = t.createdbyid ";
  query += " LEFT JOIN public.user mu ON mu.Id = t.lastmodifiedbyid ";
  const result = await sql.query(query + ` WHERE t.id = $1`, [id]);
  // const result = await sql.query(
  //   `SELECT * FROM ${this.schema}.task WHERE id = $1`,
  //   [id]
  // );
  console.log("Rows ", result.rows);
  if (result.rows.length > 0) return result.rows[0];

  return null;
}

async function findByParentId(pid) {
  //console.log("id ", id);
  //const result = await sql.query(`SELECT * FROM task WHERE parentid = $1`,[pid]);
  console.log("=======Task findByParentId========");
  let query = "SELECT tsk.*, ";
  query += " concat(cu.firstname, ' ' , cu.lastname) createdbyname, ";
  query += " concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, ";
  query += " concat(owner.firstname, ' ' , owner.lastname) ownername ";
  query += ` FROM ${this.schema}.task tsk `;
  query += " INNER JOIN public.user cu ON cu.Id = tsk.createdbyid ";
  query += " INNER JOIN public.user mu ON mu.Id = tsk.lastmodifiedbyid ";
  query += " INNER JOIN public.user owner ON owner.Id = tsk.ownerid ";
  try {
    const result = await sql.query(query + " WHERE tsk.parentid = $1", [pid]);
    if (result.rows.length > 0) return result.rows;
  } catch (error) {
    console.log("ERROR:", error);
  }

  return null;
}

//.......................................find all Task................................
async function findAll(title) {
  console.log("=====Find All Task======");
  let query = "SELECT tsk.*, ";
  query += " concat(cu.firstname, ' ' , cu.lastname) createdbyname, ";
  query += " concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, ";
  query += " concat(owner.firstname, ' ' , owner.lastname) ownername ";
  //query += " concat(prnt.firstname, ' ' , prnt.lastname) parentname ";
  query += ` FROM ${this.schema}.task tsk `;
  query += " INNER JOIN public.user cu ON cu.Id = tsk.createdbyid ";
  query += " INNER JOIN public.user mu ON mu.Id = tsk.lastmodifiedbyid ";
  query += " INNER JOIN public.user owner ON owner.Id = tsk.ownerid ";

  query += ` ORDER BY tsk.createddate DESC`;

  if (title) {
    query += ` WHERE tsk.title LIKE '%${title}%'`;
  }

  const result = await sql.query(query);
  console.log("rows:===>", result.rows);
  return result.rows;
}

//..............................................Update Task................................
async function updateById(id, newtTask, userid) {
  delete newtTask.id;
  newtTask["lastmodifiedbyid"] = userid;

  const query = buildUpdateQuery(id, newtTask, this.schema);
  // Turn req.body into an array of values
  var colValues = Object.keys(newtTask).map(function (key) {
    return newtTask[key];
  });

  console.log("query:", query);
  const result = await sql.query(query, colValues);
  if (result.rowCount > 0) {
    return { id: id, ...newtTask };
  }
  return null;
}

//.......................Delete Task...........................
async function deleteTask(id) {
  const taskResult = await sql.query(
    `SELECT type FROM ${this.schema}.task WHERE id = $1`,
    [id]
  );
  console.log("taskResult:", taskResult);
  if (taskResult.rowCount > 0 && taskResult.rows[0].type == "dailytask") {
    console.log("deleting related task history:");
    const historyresult = await sql.query(
      `DELETE FROM ${this.schema}.taskhistory WHERE taskid = $1`,
      [id]
    );
  }
  const result = await sql.query(
    `DELETE FROM ${this.schema}.task WHERE id = $1`,
    [id]
  );
  if (result.rowCount > 0) return "Success";
  return null;
}

function buildUpdateQuery(id, cols, schema) {
  // Setup static beginning of query
  var query = [`UPDATE ${schema}.task`];
  query.push("SET");

  // Create another array storing each set command
  // and assigning a number value for parameterized query
  var set = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + " = ($" + (i + 1) + ")");
  });
  query.push(set.join(", "));

  // Add the WHERE statement to look up by id
  query.push("WHERE id = '" + id + "'");

  // Return a complete query string
  return query.join(" ");
}
async function findAllOpen(userinfo) {
  console.log("userinfo :>> ", userinfo);
  let query = `SELECT t.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, concat(ow.firstname, ' ' , ow.lastname) ownername FROM ${this.schema}.task t `;
  query += " INNER JOIN public.user ow ON ow.id = ownerid ";
  query += " LEFT JOIN public.user cu ON cu.Id = t.createdbyid ";
  query += " LEFT JOIN public.user mu ON mu.Id = t.lastmodifiedbyid ";

  query += ` WHERE status in ('Not Started', 'In Progress' , 'Waiting') AND type != 'dailytask'`;

  if (userinfo.userrole === "USER") {
    query += ` AND ownerid = $1 `;
    query += " ORDER BY createddate DESC ";
    const result = await sql.query(query, [userinfo.id]);
    console.log("rows:===>", result.rows);
    return result.rows;
  } else {
    query += " ORDER BY createddate DESC ";
    console.log("qry ", query);
    const result = await sql.query(query);
    //console.log('rows:===>', result.rows);
    return result.rows;
  }
}
async function findAllMeetings(userinfo, today) {
  let query = `SELECT *,concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, concat(ow.firstname, ' ' , ow.lastname) ownername FROM ${this.schema}.task`;
  query += " INNER JOIN public.user ow ON ow.id = ownerid ";
  query += " LEFT JOIN public.user cu ON cu.Id = task.createdbyid ";
  query += " LEFT JOIN public.user mu ON mu.Id = task.lastmodifiedbyid ";

  if (today) {
    query += ` WHERE type = 'Meeting' AND startdatetime::date = now()::date AND ownerid = $1`;
  } else {
    query += ` WHERE type = 'Meeting' AND ownerid = $1`;
  }

  query += " ORDER BY createddate DESC ";

  const result = await sql.query(query, [userinfo.id]);
  console.log("rows:===>", result.rows);
  return result.rows;
}

async function findAllToday() {
  let query = `SELECT *, concat(ow.firstname, ' ' , ow.lastname) ownername FROM ${this.schema}.task`;
  query += " INNER JOIN public.user ow ON ow.id = ownerid ";

  //if (title) {
  query += ` WHERE createddate::date = now()::date`;
  // }

  query += " ORDER BY createddate DESC ";

  const result = await sql.query(query);
  console.log("rows:===>", result.rows);
  return result.rows;
}

module.exports = {
  init,
  findById,
  updateById,
  findAll,
  create,
  deleteTask,
  findByParentId,
  findAllOpen,
  findAllToday,
  findAllMeetings,
  findParentTypeLead,
};
