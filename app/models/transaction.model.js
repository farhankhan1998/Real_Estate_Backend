const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}
//....................................... create transaction.........................................
async function create(newTransaction, userid) {
  delete newTransaction.id;
  try {
    const result = await sql.query(
      `INSERT INTO ${this.schema}.transaction (type, title, status, paymentstatus, category, amount, description, parentid, transactiondate, createdbyid, lastmodifiedbyid)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        newTransaction.type,
        newTransaction.title,
        newTransaction.status,
        newTransaction.paymentstatus,
        newTransaction.category,
        newTransaction.amount,
        newTransaction.description,
        newTransaction.parentid,
        newTransaction?.targetdate != null
          ? newTransaction.targetdate
          : newTransaction.transactiondate,
        userid,
        userid,
      ]
    );
    if (result.rows.length > 0) {
      return { id: result.rows[0].id, ...newTransaction };
    }
  } catch (error) {
    console.log(error);
  }

  return null;
}

//....................................... create transaction from the FB Ads............................................
async function createFB(newTransaction, userid) {
  //delete newTransaction.id;
  console.log("===model area==");
  try {
    const { legacyid, pageid, formid, adid, FULL_NAME, EMAIL, PHONE } =
      newTransaction;

    var firstName = FULL_NAME.split(" ").slice(0, -1).join(" ");
    var lastName = FULL_NAME.split(" ").slice(-1).join(" ");

    const result = await sql.query(
      `INSERT INTO ${this.schema}.transaction (firstname, lastname, email, phone, pageid, formid, adid, legacyid, transactionsource, ownerid, createdbyid, lastmodifiedbyid)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        firstName,
        lastName,
        EMAIL,
        PHONE,
        pageid,
        formid,
        adid,
        legacyid,
        "Facebook",
        userid,
        userid,
        userid,
      ]
    );
    if (result.rows.length > 0) {
      return { id: result.rows[0].id, ...newTransaction };
    }
  } catch (error) {
    console.log("===model==" + JSON.stringify(error));
  }

  return null;
}
//.....................................find transaction by id........................................
async function findById(id) {
  //const result = await sql.query(`SELECT * FROM transaction WHERE id = $1`,[id]);
  let query = `SELECT ${this.schema}.transaction.* ,concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname  FROM ${this.schema}.transaction `;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.transaction.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.transaction.lastmodifiedbyid `;
  //query += ` INNER JOIN public.user owner ON owner.Id = ${this.schema}.transaction.ownerid `;
  // query += ` INNER JOIN ${this.schema}.contact contact ON contact.Id = ${this.schema}.transaction.contactid `;

  const result = await sql.query(
    query + ` WHERE ${this.schema}.transaction.id = $1`,
    [id]
  );

  if (result.rows.length > 0) return result.rows[0];

  return null;
}

//.....................................find transaction by ownerId....................................
async function findByOwnerId(id) {
  //console.log("id ", id);
  //const result = await sql.query(`SELECT * FROM transaction WHERE ownerid = $1`,[id]);
  let query = `SELECT ${this.schema}.transaction.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, concat(owner.firstname, ' ' , owner.lastname) ownername  FROM ${this.schema}.transaction `;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.transaction.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.transaction.lastmodifiedbyid `;
  query += ` INNER JOIN public.user owner ON owner.Id = ${this.schema}.transaction.ownerid `;

  const result = await sql.query(
    query + ` WHERE ${this.schema}.transaction.ownerid = $1`,
    [id]
  );
  if (result.rows.length > 0) return result.rows;

  return null;
}

//.......................................find all transaction................................
async function findAll(title) {
  let query = `SELECT ${this.schema}.transaction.* ,concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname  FROM ${this.schema}.transaction`;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.transaction.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.transaction.lastmodifiedbyid `;
  query += `ORDER BY createddate DESC`;

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  const result = await sql.query(query);
  //console.log('rows:===>', result.rows);
  return result.rows;
}

//..............................................Update Transaction................................
async function updateById(id, newTransaction, userid) {
  delete newTransaction.id;
  newTransaction["lastmodifiedbyid"] = userid;
  const query = buildUpdateQuery(id, newTransaction, this.schema);

  console.log("query:", query);
  // Turn req.body into an array of values
  var colValues = Object.keys(newTransaction).map(function (key) {
    return newTransaction[key];
  });

  console.log("query:", query);
  const result = await sql.query(query, colValues);
  if (result.rowCount > 0) {
    return { id: id, ...newTransaction };
  }
  return null;
}

//.....................................................Delete transaction...........................
async function deleteTransaction(id) {
  const result = await sql.query(
    `DELETE FROM ${this.schema}.transaction WHERE id = $1`,
    [id]
  );

  if (result.rowCount > 0) return "Success";
  return null;
}

function buildUpdateQuery(id, cols, schema) {
  // Setup static beginning of query
  var query = [`UPDATE ${schema}.transaction`];
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
  deleteTransaction,
  findByOwnerId,
  createFB,
};
