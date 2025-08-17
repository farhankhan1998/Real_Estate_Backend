const sql = require("./db.js");

let schema = "";

function init(schema_name) {
  this.schema = schema_name;
}

async function getTotalProperties() {
    let query = `SELECT  count(${this.schema}.property.id) totalproperties FROM ${this.schema}.property `;
    // query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.property.createdbyid `;
    // query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.property.lastmodifiedbyid `;
    // query += ` INNER JOIN public.user owner ON owner.Id = ${this.schema}.property.ownerid `;
    // query += ` INNER JOIN ${this.schema}.contact contact ON contact.Id = ${this.schema}.property.contactid `;
    // query += `INNER JOIN ${this.schema}.project proj ON proj.Id = ${this.schema}.property.projectid`;
  console.log("query ", query);
  const result = await sql.query(query);
  if (result.rows.length > 0) return result.rows;

  return null;
}

async function getTotalContacts() {
    let query = `SELECT count(con.id) totalcontacts FROM ${this.schema}.contact con`;
    query += " LEFT JOIN public.user cu ON cu.Id = con.createdbyid ";
    query += " LEFT JOIN public.user mu ON mu.Id = con.lastmodifiedbyid ";
    const result = await sql.query(query);
    if (result.rows.length > 0) return result.rows;
    
    return null;
}



async function getTotalLeads() {
    let query = `SELECT count(${this.schema}.lead.id) totalleads FROM ${this.schema}.lead `;
    query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.lead.createdbyid `;
    query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.lead.lastmodifiedbyid `;
    query += ` INNER JOIN public.user owner ON owner.Id = ${this.schema}.lead.ownerid `;
  
    const result = await sql.query(query);
    if (result.rows.length > 0) return result.rows;
    
    return null;
}


async function getTotalIncome() {
    //let query = "SELECT * FROM transaction";
    let query =
      `SELECT sum(${this.schema}.transaction.amount) totalincome  FROM ${this.schema}.transaction where type = 'Income' `;
    const result = await sql.query(query);
    if (result.rows.length > 0) return result.rows;
  }

module.exports = {
    init,
    getTotalProperties,
    getTotalContacts,
    getTotalLeads,
    getTotalIncome
  };
  
