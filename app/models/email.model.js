const sql = require("./db.js");

let schema = ""
function init(schema_name) {
  this.schema = schema_name
}

async function createEmail(emailData, userid) {
  delete emailData.id;
  console.log('emailData :>> ', emailData);
  const result = await sql.query(
    `INSERT INTO ${this.schema}.email (
      toaddress, fromaddress, ccaddress, subject, body, attachments, pdf, parentid, createdbyid
    )  
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      emailData.toaddress,
      emailData.fromaddress,
      emailData.ccaddress,
      emailData.subject,
      emailData.body,
      JSON.stringify(emailData.attachments),
      JSON.stringify(emailData.pdf),
      emailData.parentid,
      userid,
    ]
  );

  if (result.rowCount > 0) {
    return result.rows[0];
  }

  return null;
}

async function findById(id) {
  const result = await sql.query(
    `SELECT * FROM ${this.schema}.email WHERE id = $1`,
    [id]
  );

  if (result.rowCount > 0) {
    return result.rows[0];
  }

  return null;
}

// async function findByParent(parentid) {
//   const result = await sql.query(`SELECT * FROM ${this.schema}.email WHERE parentid = $1`, [parentid]);

//   return result.rows;
// }
async function findByParent(parentid) {
  const result = await sql.query(`SELECT * FROM ${this.schema}.email WHERE parentid = $1 ORDER BY createddate DESC`, [parentid]);

  return result.rows;
}


module.exports = {
  init,
  createEmail,
  findById,
  findByParent,
};
