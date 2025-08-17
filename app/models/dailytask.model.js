const sql = require("./db.js")

let schema = ""
function init(schema_name) {
  this.schema = schema_name
}
//....................................... create DailyTask.........................................
async function create(newTask, userid) {
  console.log(".... create DailyTask.....")
  console.log("userid==", userid)
  delete newTask.id
  console.log("newTask :>> ", newTask)
  const result = await sql.query(
    `INSERT INTO ${this.schema}.dailyTask 
    (
        title, priority, status, description, targetdate, details, emailsreceived, 
        emailsrepliedexceptproposalsend, underconstructionproperties, followuptaken, completionofconstruction, sellerleadgenerated, 
        sellerleadconfirmed, followuptakenfrompotentialsellers, ppt, proposalsend, onlineplatformupdate, clientdatabasedupdated, 
        crmupdate, otherwork1, otherwork2, otherwork3, otherwork4, ownerid, createdbyid, lastmodifiedbyid
    )  
    VALUES 
    (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26

    ) 
    RETURNING *`,
    [
      newTask.title,
      newTask.priority,
      newTask.status,
      newTask.description,
      newTask.targetdate,
      newTask.details,
      newTask.emailsreceived,
      newTask.emailsrepliedexceptproposalsend,
      newTask.underconstructionproperties,
      newTask.followuptaken,
      newTask.completionofconstruction,
      newTask.sellerleadgenerated,
      newTask.sellerleadconfirmed,
      newTask.followuptakenfrompotentialsellers,
      newTask.ppt,
      newTask.proposalsend,
      newTask.onlineplatformupdate,
      newTask.clientdatabasedupdated,
      newTask.crmupdate,
      newTask.otherwork1,
      newTask.otherwork2,
      newTask.otherwork3,
      newTask.otherwork4,
      newTask.ownerid,
      userid,
      userid
    ]
  )
  if (result.rowCount > 0) {
    return result.rows[0]
  }

  return null
}
// //.....................................find DailyTask Daily DailyTask........................................
async function findDailyTasks(userinfo) {
  let query = `SELECT t.*, concat(ow.firstname, ' ', ow.lastname) ownername, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.dailyTask t  
  INNER JOIN public.user ow ON ow.id = ownerid 
  LEFT JOIN public.user cu ON cu.Id = t.createdbyid
  LEFT JOIN public.user mu ON mu.Id = t.lastmodifiedbyid`

  if (userinfo.userrole === "USER") {
    query += ` LEFT JOIN ${this.schema}.taskhistory ON taskhistory.taskid = t.id
    WHERE (taskhistory.oldvalue = '${userinfo.id}' or taskhistory.newvalue = '${userinfo.id}') or t.ownerid = '${userinfo.id}'`
    // ` WHERE ownerid = '${userinfo.id}' `
  }
  query += " ORDER BY createddate DESC "
  console.log("qry ", query)
  const result = await sql.query(query)
  return result.rows
}

// // .....................................find DailyTask Daily DailyTask by id........................................
async function findDailyTasksByid(taskid, userinfo) {
  let query = `SELECT t.*, concat(ow.firstname, ' ' , ow.lastname) ownername ,concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.dailyTask t `
  query += " INNER JOIN public.user ow ON ow.id = ownerid ";
  query += " LEFT JOIN public.user cu ON cu.Id = t.createdbyid ";
  query += " LEFT JOIN public.user mu ON mu.Id = t.lastmodifiedbyid ";
  if (userinfo.userrole === "USER") {
    query += `LEFT JOIN ${this.schema}.taskhistory ON taskhistory.taskid = t.id
    WHERE ((taskhistory.oldvalue = '${userinfo.id}' or taskhistory.newvalue = '${userinfo.id}') or t.ownerid = '${userinfo.id}') AND t.id = $1`
    // ` WHERE ownerid = '${userinfo.id}' `
  } else {
    query += ` WHERE t.id = $1 `
  }
  query += " ORDER BY createddate DESC "
  console.log("qry ", query)
  const result = await sql.query(query, [taskid])
  console.log("userinfo :>> ", userinfo)
  if (result.rowCount == 0) {
    return { error: "Unauthorized" }
  }
  //console.log('rows:===>', result.rows);
  return result.rows
}


// async function findByOwnerId(ownerId) {
//   let query = `
//     SELECT 
//       tsk.*, 
//       cu.firstname || ' ' || cu.lastname AS createdbyname,
//       mu.firstname || ' ' || mu.lastname AS lastmodifiedbyname,
//       owner.firstname || ' ' || owner.lastname AS ownername
//     FROM ${this.schema}.dailyTask tsk
//     INNER JOIN public.user cu ON cu.id = tsk.createdbyid
//     INNER JOIN public.user mu ON mu.id = tsk.lastmodifiedbyid
//     INNER JOIN public.user owner ON owner.id = tsk.ownerid
//     WHERE tsk.ownerid = $1
//   `

//   console.log("query:", query)
//   try {
//     const result = await sql.query(query, [ownerId])
//     if (result.rows.length > 0) return result.rows
//   } catch (error) {
//     console.log("ERROR:", error)
//   }

//   return null
// }

//.......................................find all DailyTask................................

// async function findAll(title) {
//   console.log("=====Find All DailyTask======")

//   let query = `
//     SELECT 
//       tsk.*, 
//       cu.firstname || ' ' || cu.lastname AS createdbyname,
//       mu.firstname || ' ' || mu.lastname AS lastmodifiedbyname,
//       owner.firstname || ' ' || owner.lastname AS ownername
//     FROM ${this.schema}.dailyTask tsk
//     INNER JOIN public.user cu ON cu.id = tsk.createdbyid
//     INNER JOIN public.user mu ON mu.id = tsk.lastmodifiedbyid
//     INNER JOIN public.user owner ON owner.id = tsk.ownerid
//   `

//   if (title) {
//     query += ` WHERE tsk.title LIKE $1`
//   }

//   query += ` ORDER BY tsk.createddate DESC`

//   try {
//     const result = await sql.query(query, [title ? `%${title}%` : null])
//     console.log("rows:===>", result.rows)
//     return result.rows
//   } catch (error) {
//     console.log("ERROR:", error)
//     return null
//   }
// }

// //.......................................find all DailyTask................................
// async function findAll(title) {
//   console.log("=====Find All DailyTask======")
//   let query = "SELECT tsk.*, "
//   query += " concat(cu.firstname, ' ' , cu.lastname) createdbyname, "
//   query += " concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, "
//   query += " concat(owner.firstname, ' ' , owner.lastname) ownername "
//   query += ` FROM ${this.schema}.dailyTask tsk `
//   query += " INNER JOIN public.user cu ON cu.Id = tsk.createdbyid "
//   query += " INNER JOIN public.user mu ON mu.Id = tsk.lastmodifiedbyid "
//   query += " INNER JOIN public.user owner ON owner.Id = tsk.ownerid "

//   if (title) {
//     query += ` WHERE tsk.title LIKE '%${title}%'`
//   }

//   query += ` ORDER BY tsk.createddate DESC`

//   const result = await sql.query(query)
//   console.log("SQL Query:", result)
//   console.log("Rows:", result.rows)

//   return result.rows
// }

//..............................................Update DailyTask................................
async function updateById(id, newtTask, userid) {
  delete newtTask.id
  newtTask["lastmodifiedbyid"] = userid

  const query = buildUpdateQuery(id, newtTask, this.schema)
  // Turn req.body into an array of values
  var colValues = Object.keys(newtTask).map(function (key) {
    return newtTask[key]
  })

  console.log("query:", query)
  const result = await sql.query(query + " RETURNING * ", colValues)
  if (result.rowCount > 0) {
    return result.rows
  }
  return null
}

//.......................Delete DailyTask...........................

async function deleteTask(id) {
  try {
    // Use the SQL DELETE statement to delete the record
    const result = await sql.query(
      `DELETE FROM ${this.schema}.dailyTask WHERE id = $1 RETURNING *`,
      [id]
    )

    // Check if any rows were affected (indicating a successful delete)
    if (result.rows.length > 0) {
      return { success: true, message: "Record deleted successfully" }
    }

    // If no rows were affected, the record with the given ID was not found
    return { success: false, message: "Record not found" }
  } catch (error) {
    console.error("Error deleting record:", error)
    // Handle errors appropriately
    return {
      success: false,
      message: "An error occurred while deleting the record",
      error : error.message
    }
  }
}
function buildUpdateQuery(id, cols, schema) {
  // Setup static beginning of query
  var query = [`UPDATE ${schema}.dailyTask`]
  query.push("SET")

  // Create another array storing each set command
  // and assigning a number value for parameterized query
  var set = []
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + " = ($" + (i + 1) + ")")
  })
  query.push(set.join(", "))

  // Add the WHERE statement to look up by id
  query.push("WHERE id = '" + id + "'")

  // Return a complete query string
  return query.join(" ")
}

module.exports = {
  init,
  updateById,
  create,
  deleteTask,
  findDailyTasksByid,
  findDailyTasks,
}
