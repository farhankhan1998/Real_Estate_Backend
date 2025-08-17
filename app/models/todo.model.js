const sql = require("./db.js");

let schema = "";

function init(schema_name) {
  this.schema = schema_name;
}

async function create(newTodo, userid) {
  try {
    const result = await sql.query(
      `INSERT INTO ${this.schema}.todo (name, details, createdbyid, lastmodifiedbyid) 
        SELECT $1, $2, $3, $4
        FROM public.user u
        WHERE u.id = $3
        RETURNING *,
                 (SELECT firstname || ' ' || lastname FROM public.user WHERE id = $3) AS createdbyname,
                 (SELECT firstname || ' ' || lastname FROM public.user WHERE id = $4) AS lastmodifiedbyname`,
      [newTodo.name, JSON.stringify(newTodo.details), userid, userid]
    );

    if (result.rows.length > 0) {
      return {
        statusCode: 201,
        data: result.rows[0],
        errors: "",
        message: "Todo has been created successfully!",
      };
    } else {
      return {
        statusCode: 400,
        message: "Insert Todo failed",
      };
    }
  } catch (error) {
    console.log("error in Todo create method - ", error);
    return {
      statusCode: 500,
      errors: error.message,
      data: {},
      message: "",
    };
  }
}

async function findById(id) {
  try {
    const query = `
    SELECT 
    todo.id, 
    todo.name, 
    todo.details, 
    todo.createdbyid, 
    todo.lastmodifiedbyid,
    mu.firstname  || ' ' || mu.lastname AS createdbyname,
    mu.firstname  || ' ' || mu.lastname AS lastmodifiedbyname
  FROM ${this.schema}.todo AS todo
  LEFT JOIN public.user AS cu ON cu.id = todo.createdbyid
  LEFT JOIN public.user AS mu ON mu.id = todo.lastmodifiedbyid
  WHERE todo.id = $1
`;

    const result = await sql.query(query, [id]);

    if (result.rows.length > 0) {
      return {
        statusCode: 200,
        data: result.rows[0],
        message: "Todo Record Found By ID",
        errors: "",
      };
    } else {
      return {
        statusCode: 400,
        message: "No Record Found",
      };
    }
  } catch (error) {
    console.log("error in Todo Find method - ", error);
    return {
      statusCode: 500,
      errors: error.message,
      data: {},
      message: "",
    };
  }
}

async function findAll() {
  try {
    const query = `
    SELECT 
    todo.id, 
    todo.name, 
    todo.details, 
    todo.createdbyid, 
    todo.lastmodifiedbyid,
    mu.firstname  || ' ' || mu.lastname AS createdbyname,
    mu.firstname  || ' ' || mu.lastname AS lastmodifiedbyname
  FROM ${this.schema}.todo AS todo
  LEFT JOIN public.user AS cu ON cu.id = todo.createdbyid
  LEFT JOIN public.user AS mu ON mu.id = todo.lastmodifiedbyid
`;

    const result = await sql.query(query);
    return {
      statusCode: 200,
      data: result.rows,
      message: "All Todo Records Found",
      errors: "",
    };
  } catch (error) {
    console.log("error in Todo FindAll method - ", error);
    return {
      statusCode: 500,
      errors: error.message,
      data: [],
      message: "",
    };
  }
}

async function deleteById(id) {
  try {
    const result = await sql.query(
      `DELETE FROM ${this.schema}.todo WHERE id = $1`,
      [id]
    );

    if (result.rowCount > 0) {
      return {
        statusCode: 200,
        errors: "",
        message: "Todo Deleted Successfully",
      };
    } else {
      return {
        statusCode: 400,
        message: "No Record Found",
      };
    }
  } catch (error) {
    console.log("error in Todo Delete method - ", error);
    return {
      statusCode: 500,
      errors: error.message,
      message: "Error occurred while deleting the Todo",
      data: {},
    };
  }
}

async function updateById(id, updatedTodo, userid) {
  try {
    delete updatedTodo.id;
    updatedTodo["lastmodifiedbyid"] = userid;
    const { name, details } = updatedTodo;
    updatedTodo["details"] = JSON.stringify(details);
    const updateQuery = buildUpdateQuery(id, updatedTodo, this.schema);

    const result = await sql.query(updateQuery.query, updateQuery.values);

    if (result.rowCount > 0) {
      return {
        statusCode: 200,
        data: result.rows[0],
        errors: "",
        message: "Todo updated successfully!",
      };
    } else {
      return {
        statusCode: 400,
        message: "No Records Found",
      };
    }
  } catch (error) {
    console.log("error in Todo update method - ", error);
    return {
      statusCode: 500,
      errors: error.message,
      data: {},
      message: "",
    };
  }
}
function buildUpdateQuery(id, cols, schema) {
  // Setup static beginning of query
  var query = [`UPDATE ${schema}.todo`];
  query.push("SET");

  // Create another array storing each set command
  // and assigning a number value for a parameterized query
  var set = [];
  var values = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + " = $" + (i + 1));
    values.push(cols[key]);
  });
  query.push(set.join(", "));

  // Add the WHERE statement to look up by id
  query.push("WHERE id = $" + (values.length + 1));

  // Add the ID to the values
  values.push(id);

  // Return an object containing the query and values
  let finalQuery = query.join(" ") + " RETURNING *";
  return { query: finalQuery, values };
}

module.exports = {
  init,
  create,
  findById,
  findAll,
  deleteById,
  updateById,
};
