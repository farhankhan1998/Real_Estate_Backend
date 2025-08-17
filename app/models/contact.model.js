const contactRoutes = require("../routes/contact.routes.js");
const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}

async function create(newContact, userid) {
  console.log('-----create model--------');
  delete newContact.id;

  const result = await sql.query(
    `INSERT INTO ${this.schema}.contact 
     (salutation, title, firstname, lastname, email, phone, street, city, state, pincode, country, Company, type, createdbyid, lastmodifiedbyid, contactcreateddate)  
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
    [newContact.salutation, newContact.title, newContact.firstname, newContact.lastname, newContact.email, newContact.phone, newContact.street, newContact.city, newContact.state, newContact.pincode, newContact.country, newContact.company, newContact.type, userid, userid,newContact.contactcreateddate]
  );

  if (result.rows.length > 0) {
    return { id: result.rows[0].id, ...newContact };
  }

  return null;
}


async function findById (id) {
    console.log("id ", id);
    //const result = await sql.query(`SELECT * FROM contact WHERE id = $1`,[id]);
    let query = `SELECT con.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.contact con`;

    query += " LEFT JOIN public.user cu ON cu.Id = con.createdbyid ";
    query += " LEFT JOIN public.user mu ON mu.Id = con.lastmodifiedbyid ";
    //query += ` WHERE con.id = $1`,[id];
    

    const result = await sql.query(query + ` WHERE con.id = $1`,[id]);

    console.log("Rows ", result.rows);
    if(result.rows.length > 0)
      return result.rows[0];
  
  return null;
};

async function findAll(title){
  let query = `SELECT con.*, concat(con.firstname, ' ' , con.lastname) contactname, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.contact con`;

  query += " LEFT JOIN public.user cu ON cu.Id = con.createdbyid ";
  query += " LEFT JOIN public.user mu ON mu.Id = con.lastmodifiedbyid ";
  
  if (title) {
    query += ` WHERE con.title LIKE '%${title}%'`;
  }
  
  query += ` ORDER BY con.createddate DESC`;


  const result = await sql.query(query);
  console.log('rows:===>', result.rows);
  return result.rows;    
};




async function updateById(id, newContact, userid) {
  console.log('===Model Contact Update====');
  delete newContact.id;
  newContact['lastmodifiedbyid'] = userid;

  const query = buildUpdateQuery(id, newContact, this.schema);
  
  // Turn newContact into an array of values
  var colValues = Object.keys(newContact).map(function (key) {
    return newContact[key];
  });

  console.log('query:', query);
  const result = await sql.query(query, colValues);
  if (result.rowCount > 0) {
    return { "id": id, ...newContact };
  }
  return null;
}


async function deleteContact(id){
  const result = await sql.query(`DELETE FROM ${this.schema}.contact WHERE id = $1`, [id]);
  
  if(result.rowCount > 0)
    return "Success"
  return null;
};



function buildUpdateQuery (id, cols, schema) {
  // Setup static beginning of query
  var query = [`UPDATE ${schema}.contact`];
  query.push('SET');

  // Create another array storing each set command
  // and assigning a number value for parameterized query
  var set = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + ' = ($' + (i + 1) + ')'); 
  });
  query.push(set.join(', '));

  // Add the WHERE statement to look up by id
  query.push('WHERE id = \'' + id + '\'');

  // Return a complete query string
  return query.join(' ');
}

module.exports = {init, findById, updateById, findAll, create, deleteContact};
