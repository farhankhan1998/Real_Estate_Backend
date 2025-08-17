const sql = require("./db.js");
const global = require("../constants/global.js");

async function createUser(newUser) {

  console.log("new data --> ",newUser);

  const { firstname, lastname, email, phone, password, userrole, companyid, joiningdate, leavingdate, isactive } =
    newUser;
  const result = await sql.query(
    "INSERT into public.user (firstname, lastname, email, phone, password, userrole, companyid, joiningdate, leavingdate, isactive) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, firstname, lastname, email, phone, password, userrole, companyid, joiningdate, leavingdate, isactive",
    [firstname, lastname, email, phone, password, userrole, companyid, joiningdate, leavingdate, isactive]
  );
  if (result.rowCount > 0) {
    return result.rows[0];
  }
  return null;
}

async function setRole(userrole, userRec) {
  let roleId = userrole == "ADMIN" ? global.ADMIN_ROLE_ID : global.USER_ROLE_ID;
  console.log("roleId : ", roleId);

  const result = await sql.query(
    "INSERT into public.userrole (roleid, userid) VALUES ($1, $2) RETURNING * ",
    [roleId, userRec.id]
  );

  if (result.rowCount > 0) {
    return result.rows[0];
  }
  return null;
}

async function checkLicenses(companyid, currentUserId) {
  const company = await sql.query(
    "SELECT userlicenses from company where id = $1 ",
    [companyid]
  );
  let allowedUserLicenses = 0;
  if (company.rowCount > 0) {
    allowedUserLicenses = company.rows[0].userlicenses;
  }

  let result = null;
  if (currentUserId) {
    result = await sql.query(
      "SELECT count(*) total from public.user where companyid = $1 AND isactive=true AND id != $2",
      [companyid, currentUserId]
    );
  } else {
    result = await sql.query(
      "SELECT count(*) total from public.user where companyid = $1 AND isactive=true",
      [companyid]
    );
  }

  let existingLicenses = 0;
  if (result.rowCount > 0) {
    existingLicenses = result.rows[0].total;
  }

  if (allowedUserLicenses > existingLicenses) return true;
  else return false;
}

async function findByEmail(email) {
  const result = await sql.query(
    `select
  json_build_object(
          'id', u.id,
          'firstname', u.firstname,
          'lastname', u.lastname,
          'email', u.email,
          'phone',u.phone,
          'userrole', u.userrole,
          'companyid', u.companyid,          
          'password', u.password,
          'companyname', c.name,
          'tenantcode', c.tenantcode,
          'logourl', c.logourl,
          'sidebarbgurl', c.sidebarbgurl,
          'permissions', json_agg(json_build_object(
                  'name', PERMISSION.name
          ))
) AS userinfo
FROM ROLEPERMISSION
INNER JOIN ROLE ON ROLEPERMISSION.roleid = ROLE.id
INNER JOIN PERMISSION ON ROLEPERMISSION.permissionid =  PERMISSION.id 
INNER JOIN USERROLE ON USERROLE.roleid = ROLEPERMISSION.roleid
INNER JOIN public.USER u ON USERROLE.userid = u.id
INNER JOIN public.COMPANY c ON u.companyid = c.id
WHERE u.email = $1 AND c.isactive = true
GROUP BY u.email, u.id, u.firstname, u.companyid, c.name, c.tenantcode, c.logourl, c.sidebarbgurl`,
    [email]
  );
  if (result.rows.length > 0) return result.rows[0];
  return null;
}

async function findById(id) {
  try {
    let query = `SELECT u.id, u.email, u.firstname, u.lastname, u.userrole, u.phone, u.isactive, u.managerid,`;
    query += ` u.joiningdate, u.leavingdate, concat(mu.firstname,' ', mu.lastname) managername FROM public.user u`;
    query += ` LEFT JOIN public.user mu ON mu.id = u.managerid `;
    query += ` WHERE u.id = $1`;
    const result = await sql.query(query, [id]);
    if (result.rows.length > 0) return result.rows[0];
  } catch (error) {
    console.log("error ", error);
  }

  return null;
}


async function updateRecById(id, userRec, userid) {
  delete userRec.id;
  //userRec['lastmodifiedbyid'] = userid;
  console.log("--==--");
  const query = buildUpdateQuery(id, userRec);
  // Turn req.body into an array of values
  var colValues = Object.keys(userRec).map(function (key) {
    return userRec[key];
  });

  console.log("query:", query);
  try {
    const result = await sql.query(query, colValues);
    if (result.rowCount > 0) {
      return { id: id, ...userRec };
    }
  } catch (error) {
    return { isError: true, errors: error };
  }

  return null;
}

async function updateById(id, userRec) {
  try {
    const result = await sql.query(
      `UPDATE public.user SET password = $1 WHERE id = $2`,
      [userRec.password, id]
    );
    if (result.rowCount > 0) return "Updated successfully";
  } catch (error) {
    console.log("error ", error);
  }

  return null;
}

async function findAll(companyid) {
  try {
    let query =
      "SELECT u.id, concat(u.firstname, ' ' ,u.lastname) username, concat(mu.firstname,' ', mu.lastname) managername, u.managerid, u.firstname, u.lastname, u.email, u.userrole, u.phone, u.isactive,";
    query += " u.joiningdate, u.leavingdate FROM public.user u ";
    query += ` LEFT JOIN public.user mu ON mu.id = u.managerid `;
    query += " WHERE u.companyid = $1";
    const result = await sql.query(query, [companyid]);

    if (result.rows.length > 0) return result.rows;
  } catch (error) {
    console.log("error ", error);
  }

  return null;
}

async function findActiveUsers(companyid) {
  try {
    let query =
      "SELECT u.id, concat(u.firstname, ' ' ,u.lastname) username, concat(mu.firstname,' ', mu.lastname) managername, u.managerid, u.firstname, u.lastname, u.email, u.userrole, u.phone, u.isactive FROM public.user u ";
    query += ` LEFT JOIN public.user mu ON mu.id = u.managerid `;
    query += " WHERE u.companyid = $1 AND u.isactive = true";
    const result = await sql.query(query, [companyid]);

    if (result.rows.length > 0) return result.rows;
  } catch (error) {
    console.log("error ", error);
  }

  return null;
}

function buildUpdateQuery(id, cols) {
  // Setup static beginning of query
  var query = ["UPDATE public.user "];
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

async function getAllManager(role) {
  console.log("Role:", role);
  try {
    //ORDER BY createddate DESC
    var query =
      "SELECT id, isactive, concat(firstname, ' ' ,lastname) username, userrole FROM public.user WHERE ";
    query += " userrole = 'SUPER_ADMIN' OR  userrole = 'ADMIN' ";

    console.log(query);
    result = await sql.query(query);
    return result.rows;

    // var query = "SELECT id, concat(firstname, ' ' ,lastname) username, firstname, lastname, email, phone, adharcard dob, gender, qualificatoin, street, city, userrole, servicecategory, servicearea FROM public.user WHERE userrole = 'ADMIN'";
    // result = await sql.query(query);
    // return result.rows;
  } catch (errMsg) {
    console.log("errMsg===>", errMsg);
  }
}

module.exports = {
  createUser,
  updateRecById,
  setRole,
  findByEmail,
  findById,
  findAll,
  updateById,
  getAllManager,
  checkLicenses,
  findActiveUsers
};
