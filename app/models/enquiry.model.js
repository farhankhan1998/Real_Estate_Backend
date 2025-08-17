const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}
//....................................... create transaction.........................................
async function create(newEnquiry, userid) {
  delete newEnquiry.id;
  try {
    const result = await sql.query(
      `INSERT INTO ${this.schema}.enquiry (firstname,lastname,  email, description, createdbyid, lastmodifiedbyid,phone,leadsource)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        newEnquiry.firstname.includes(' ')?  newEnquiry.firstname.split(' ')[0] :  newEnquiry.firstname ,
        newEnquiry.lastname.includes(' ')?  newEnquiry.lastname.split(' ')[1] :  newEnquiry.lastname,
        newEnquiry.email,
        newEnquiry.description,
        // newEnquiry.transactiontype,
        // newEnquiry.verticals,
        userid,
        userid,
        newEnquiry.phone,
        newEnquiry.leadsource
      ]
    );
    if (result.rows.length > 0) {
      return { id: result.rows[0].id, ...newEnquiry };
    }
  } catch (error) {
    console.log(error);
  }

  return null;
}

//.....................................Create Lead ........................................
async function createLead(newLead, userid) {
    delete newLead.id
    const result = await sql.query(
      `INSERT INTO ${this.schema}.lead (
        firstname, lastname,email, phone,ownerid,leadstage,vertical, lastmodifiedbyid,createdbyid )  
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *`,
      [
        newLead.firstname, 
        newLead.lastname,
        newLead.email,
        newLead.phone, 
        newLead.createdbyid,
        'Active',
        '',
        userid,
        userid,
      ]
    )
    if (result.rows.length > 0) {
      return result.rows[0]
    }
    return null
  }
//.....................................find transaction by id........................................
async function findById(id) {
  let query = `SELECT ${this.schema}.enquiry.* ,concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname  FROM ${this.schema}.enquiry `;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.enquiry.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.enquiry.lastmodifiedbyid `;

  const result = await sql.query(
    query + ` WHERE ${this.schema}.enquiry.id = $1`,
    [id]
  );

  if (result.rows.length > 0) return result.rows[0];
  return null;
}

//.......................................find all transaction................................
async function findAll(title) {
  let query = `SELECT ${this.schema}.enquiry.* ,concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname  FROM ${this.schema}.enquiry`;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.enquiry.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.enquiry.lastmodifiedbyid `;
  query += `ORDER BY createddate DESC`;

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  const result = await sql.query(query);
  return result.rows;
}

//..............................................Update Transaction................................
async function updateById(id, newEnquiry, userid) {
  delete newEnquiry.id;
  newEnquiry["lastmodifiedbyid"] = userid;
  const query = buildUpdateQuery(id, newEnquiry, this.schema);

  var colValues = Object.keys(newEnquiry).map(function (key) {
    return newEnquiry[key];
  });

  const result = await sql.query(query, colValues);
  if (result.rowCount > 0) {
    return { id: id, ...newEnquiry };
  }
  return null;
}

//.....................................................Delete transaction...........................
async function deleteEnquiry(id) {
  const result = await sql.query(
    `DELETE FROM ${this.schema}.enquiry WHERE id = $1`,
    [id]
  );

  if (result.rowCount > 0) return "Success";
  return null;
}

function buildUpdateQuery(id, cols, schema) {
  // Setup static beginning of query
  var query = [`UPDATE ${schema}.enquiry`];
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

module.exports = {
  init,
  findById,
  updateById,
  findAll,
  create,
  deleteEnquiry,
  createLead,
};
