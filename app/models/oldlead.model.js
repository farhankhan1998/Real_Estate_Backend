const leadRoutes = require("../routes/oldlead.routes.js");
const sql = require("./db.js");
let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}

//....................................... create oldLead.........................................
async function createForCSV(newOldLead, userid) {
  let result = { success: false, status: 400, data: [] };
  console.log("newOldLead==>", newOldLead);
  // delete newOldLead.id;
  let allData = [];
  try {
    if(newOldLead.constructor === Object){
      newOldLead = [newOldLead]
    }
    if (newOldLead.constructor === Array) {
      for (const each of newOldLead) {
        console.log("inside loop for array:", each);
        let oldLeadFields = ["actions", "leadid", "clientname", "leadcreateddate", "leadstatus", "leadstagestatus", "area", "leadageing", "verticaltypes", "verticallocation", "requirementzone", "remarks"]
        let record = {}
        for(const eachField of oldLeadFields){
          if(each.hasOwnProperty(eachField) && each[eachField] && each[eachField] != undefined){
            record[eachField] = each[eachField]
          }
        }
        record['createdbyid'] = userid
        console.log('record:', record);
        let { query, values } = buildInsertQuery(record, this.schema)
        console.log('query:', query);
        console.log('values:', values);
        const insertResult = await sql.query(query, values)
        if(insertResult.rowCount > 0){
          allData.push(insertResult.rows[0])
        }
      }
    } 
    console.log("allData length -->", allData.length);
    if (allData.length > 0) {
      result.success = true;
      result.status = 201;
      allData.forEach((record) => {
        record.message = "OldLead created successfully";
        record.success = true;
        result.data.push(record);
      });
    } else {
      result.message = "No valid records to insert.";
    }
  } catch (e) {
    console.log("error in oldLead create method:", e);
    return e;
  }
  return result;
}

function buildInsertQuery(data, schema_name) {
  console.log("data *==>", data);
  const columns = Object.keys(data);
  console.log("columns *==>", columns);

  const placeholders = columns.map((col, index) => `$${index + 1}`);
  console.log("placeholders *==>", placeholders);

  const insertQuery = `INSERT INTO ${schema_name}.oldlead (${columns.join(
    ", "
  )}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  console.log("insertQuery *==>", insertQuery);

  return {
    query: insertQuery,
    values: columns.map((col) => data[col]),
  };
}

//.....................................find lead by id........................................
async function findById(id) {
  //const result = await sql.query(`SELECT * FROM lead WHERE id = $1`,[id]);
  let query = `SELECT ${this.schema}.oldlead.*,  concat(cu.firstname, ' ' , cu.lastname) createdbyname 
   FROM ${this.schema}.oldlead `;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.oldlead.createdbyid `;
  //query += ` LEFT JOIN ${this.schema}.lead le ON le.id = ${this.schema}.oldlead.leadid `;

  // let query = `SELECT ${this.schema}.oldlead.*,  concat(cu.firstname, ' ' , cu.lastname) createdbyname,
  //   concat(le.firstname, ' ' , le.lastname) leadname   FROM ${this.schema}.oldlead `;
  // query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.oldlead.createdbyid::uuid `;
  // query += ` LEFT JOIN ${this.schema}.lead le ON le.id::uuid = ${this.schema}.oldlead.leadid::uuid `;
  console.log("query *==>", query);

  const result = await sql.query(
    query + ` WHERE ${this.schema}.oldlead.id = $1`,
    [id]
  );
  console.log("result *==>", result);
  if (result.rows.length > 0) return result.rows[0];
  return null;
}

//.......................................find all lead................................
async function findAll(title) {
  //let query = "SELECT * FROM lead";
  let query = `SELECT ${this.schema}.oldlead.*,  concat(cu.firstname, ' ' , cu.lastname) createdbyname  FROM ${this.schema}.oldlead `;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.oldlead.createdbyid `;

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }
  query += ` ORDER BY ${this.schema}.oldlead.createddate DESC`;

  const result = await sql.query(query);
  return result.rows;
}

//.....................................................Delete lead...........................
async function deleteLead(id) {
  const result = await sql.query(
    `DELETE FROM ${this.schema}.oldlead WHERE id = $1`,
    [id]
  );

  if (result.rowCount > 0) return "Success";
  return null;
}

module.exports = {
  init,
  createForCSV,
  findById,
  findAll,
  deleteLead,
};
