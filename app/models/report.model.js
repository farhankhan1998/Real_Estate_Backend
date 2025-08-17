const sql = require("./db.js");


let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}


//....................................... create report.........................................
async function create(newReport, userid){
    delete newReport.id;
    const result = await sql.query(`INSERT INTO ${this.schema}.report (name, query, createdbyid, lastmodifiedbyid)  VALUES ($1, $2, $3, $4) RETURNING *`, 
    [newReport.name, newReport.query, userid, userid]);
    if(result.rows.length > 0){
      return { id: result.rows[0].id, ...newReport};
    }
  
    return null;
};


//.....................................find report by id........................................
// async function findById (id) {

//      const result = await sql.query(`SELECT * FROM ${this.schema}.report WHERE id = $1`,[id]);
//      console.log('id*==>',id)
//     // let query = `SELECT re.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.report re`;
//     // query += " LEFT JOIN public.user cu ON cu.Id = re.createdbyid ";
//     // query += " LEFT JOIN public.user mu ON mu.Id = re.lastmodifiedbyid ";
//     // const result = await sql.query(query + ` WHERE re.id = $1`,[id]);
    
//     if(result.rows.length > 0){
//         console.log("query ", result.rows[0].query);
//         const query = result.rows[0].query;
//         if(query) {
//             const allData = await sql.query(query);
//             console.log('allData*==>',allData);
//             return allData.rows;
//         }
//         return null;
//     }  
//   return null;
// };
async function findById(id) {
  const result = await sql.query(`SELECT * FROM ${this.schema}.report WHERE id = $1`, [id]);
  console.log('id*==>', id);
  if (result.rows.length > 0) {
      console.log("query ", result.rows[0].query);
      const query = result.rows[0].query;
      if (query) {
          const allData = await sql.query(query);
          console.log('allData*==>', allData);
          const formatDate = (dateString) => {
              const date = new Date(dateString);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
          };
          const formattedData = allData.rows
          // .map(row => {
          //     if (row.Date) {
          //         row.Date = formatDate(row.Date);
          //     }
          //     return row;
          // });
          //console.log('formattedData',formattedData);
          return formattedData;
      }
      return null;
  }
  return null;
};


//.......................................find all report................................
async function findAll(reportname){
    // let query = `SELECT * FROM ${this.schema}.report`;
    let query = `SELECT re.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.report re`;
    query += " LEFT JOIN public.user cu ON cu.Id = re.createdbyid ";
    query += " LEFT JOIN public.user mu ON mu.Id = re.lastmodifiedbyid ";

    if (reportname) {
      query += ` WHERE name LIKE '%${reportname}% AND apiname is null'`;
    }else {
      query += ` WHERE apiname is null  `
    }
  
    const result = await sql.query(query);
    return result.rows 
};

 

//..............................................Update report................................
async function updateById (id, newReport, userid){
    delete newReport.id;
    console.log("usrr",userid)
    newReport['lastmodifiedbyid'] = userid;
    const query = buildUpdateQuery(id, newReport, this.schema);
    // Turn req.body into an array of values
    var colValues = Object.keys(newReport).map(function (key) {
      return newReport[key];
    });
  
    //console.log('query:', query);
    const result = await sql.query(query,colValues);
    if(result.rowCount > 0){
      return {"id" : id, ...newReport};
    }
    return null;  
};


//.....................................................Delete report...........................
async function deleteReport(id){
    const result = await sql.query(`DELETE FROM ${this.schema}.report WHERE id = $1`, [id]);
  
    if(result.rowCount > 0)
      return "Success"
    return null;
};



function buildUpdateQuery (id, cols,schema) {
   // Setup static beginning of query
   var query = [`UPDATE ${schema}.report`];
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
};

async function fetchData(query, fromdate, todate) {
  try {
    let filteredQuery = query;

    if (query.includes('group by') && fromdate && todate) {
      filteredQuery = query.replace('group by', `WHERE DATE(createddate) >= $1 AND DATE(createddate) <= $2 GROUP BY`);
    }

    if (query.includes('WHERE') && fromdate && todate) {
      console.log('else if');
      filteredQuery = query.replace('WHERE', `WHERE DATE(createddate) >= $1 AND DATE(createddate) <= $2 AND`);
    }

    console.log('Executing query *==>', filteredQuery);
    console.log('From date*==>', fromdate);
    console.log('To date*==>', todate);

    const result = await (fromdate !== null && todate !== null
      ? sql.query(filteredQuery, [fromdate, todate])
      : sql.query(filteredQuery));

    console.log(' result*==>', result);

    return result.rows;
  } catch (error) {
    console.error('Error in fetchData *==>', error);
    throw error;
  }
}

async function findByName(name, fromdate, todate) {
  try {
    const result = await sql.query(`SELECT * FROM ${this.schema}.report WHERE apiname = $1`, [name]);
    console.log('result rows*==>', result.rows);
    if (result.rows.length > 0) {
      const query = result.rows[0].query;
      if (query) {
        const allData = await fetchData(query, fromdate, todate);
        console.log("allData *==>", allData);
        return allData;
      }
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error in findByName:', error);
    throw error; 
  }
}

module.exports = {init, findById, findByName, updateById, findAll, create, deleteReport};