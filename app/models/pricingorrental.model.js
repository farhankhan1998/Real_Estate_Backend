const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}

async function findPricingOrRentalByParentId(id) {
    console.log("Parentid *==> " + id);
    let query = `SELECT * FROM ${this.schema}.pricingorrental `;
    try {
      const result = await sql.query(query + ` WHERE pricingorrental.parentid = $1`, [id]);
      if (result.rows.length > 0) return result.rows;
    } catch (error) {
      console.log(error);
    }
    return null;
  }

async function deletePricingOrRental(ids) {
  console.log("ids *==>", ids);
  for (const id of ids) {
    console.log("insdie loop");
    console.log("idList *==>", id);

    const result = await sql.query(
      `DELETE FROM ${this.schema}.pricingorrental WHERE id = $1`,
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
  findPricingOrRentalByParentId,
  deletePricingOrRental,
};
