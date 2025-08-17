const sql = require("./db.js");
const global = require("../constants/global.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}


async function findUserRole(roleName) {
  let query = `SELECT * FROM public.role where name =$1`;
  const result = await sql.query(query, [roleName]);
  if (result.rows.length > 0) return result.rows[0];

  return null;
}

async function getSourceSchemas() {
  //let query = `SELECT schema_name FROM information_schema.schemata where schema_name like 'ibs%'`;
  let query = `select s.nspname as schema_name
    from pg_catalog.pg_namespace s
    join pg_catalog.pg_user u on u.usesysid = s.nspowner
    where nspname not in ('information_schema', 'pg_catalog', 'public')
          and nspname not like 'pg_toast%'
          and nspname not like 'pg_temp_%'
    order by schema_name`;
  const result = await sql.query(query);
  let schemanames = [];
  if (result.rows.length > 0) {
    result.rows.forEach((item) => {
      schemanames.push(item.schema_name);
    });
    return schemanames;
  }
}
// Company Update By Company Id
async function updateById(updateCompanyInfo) {
  try {
    const result = await sql.query(
      `UPDATE public.company SET sf_instanceurl = $2 , sf_refreshtoken = $3, sf_username = $4, sf_orgid = $5, sf_syncenabled = true  WHERE id = $1`,
      [
        updateCompanyInfo.company_id,
        updateCompanyInfo.instance_url,
        updateCompanyInfo.refresh_token,
        updateCompanyInfo.sf_username,
        updateCompanyInfo.sf_orgid
      ]
    );
    if (result.rowCount > 0) return "Updated successfully";
  } catch (error) {
    console.log("error ", error);
  }

  return null;
}

async function findById(company_id) {
  const query = `SELECT * FROM public.company `;
  const result = await sql.query(query + ` WHERE id = $1`, [company_id]);
  // console.log("Rows ", result.rows);
  if (result.rows.length > 0) return result.rows[0];
  return null;
}

function getFromEmailAddress(){
  let envData;
  let result;
  try {
    if (process.env && process.env.FROM_EMAIL) {
      envData = process.env.FROM_EMAIL;
      let jsonParsed = JSON.parse(envData);
      console.log('jsonParsed - ', jsonParsed);
      
      // Extract email addresses
      let allEmails = jsonParsed.map(entry => entry.email);
      
      console.log('allEmails:', allEmails);
      result = {
        data: allEmails,
        statusCode: 200
      };
    } else {
      result = {
        'data': [],
        'message': 'No emails configured',
        'statusCode': 200
      };
    }
  } catch(error) {
    result = {
      'data': [],
      'message': 'Error happened during email retrival',
      'error': error.message,
      'statusCode': 500
    };
  } finally {
    console.log('result:', result);
    return result;
  }
}



module.exports = {
  init,
  findUserRole,
  getSourceSchemas,
  updateById,
  findById,
  getFromEmailAddress
};
