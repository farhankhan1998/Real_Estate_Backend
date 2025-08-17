const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}

async function findPropertyDetailsByParentId(id) {
    console.log("Parentid *==> " + id);
    let query = `SELECT prodetails.* FROM ${this.schema}.propertydetails prodetails `;
    try {
      const result = await sql.query(query + ` WHERE prodetails.propertyid = $1`, [id]);
      if (result.rows.length > 0) return result.rows;
    } catch (error) {
      console.log(error);
    }
    return null;
  }

async function deletePropertyDetails(ids) {
  console.log("ids *==>", ids);
  for (const id of ids) {
    console.log("insdie loop");
    console.log("idList *==>", id);

    const result = await sql.query(
      `DELETE FROM ${this.schema}.propertydetails WHERE id = $1`,
      [id]
    );
    console.log("result *==>", result);

    if (result.rowCount === 0) {
      return null;
    }
  }
  return "Success";
}

module.exports = {
  init,
  findPropertyDetailsByParentId,
  deletePropertyDetails,
};
