const sql = require("./db.js")
var validator = require('validator');

let schema = ""
function init(schema_name) {
  this.schema = schema_name
}

const selectByIdQuery = (schema_name, filter, order) => {
  let query = `select sitevisithistory.*, concat(us.firstname, ' ',  us.lastname ) as fieldpersonname,  inventory.name as inventoryname,
                        CONCAT(cu.firstname, ' ' , cu.lastname) AS createdbyname, 
                        CONCAT(mu.firstname, ' ' , mu.lastname) AS lastmodifiedbyname, 
                        json_agg(DISTINCT  areadetails.*) as areadetails, json_agg(DISTINCT heightdetails.*) as heightdetails,
                        json_agg(DISTINCT pricingorrental.*) as pricingorrental
                      FROM ${schema_name}.sitevisithistory
                      LEFT JOIN public.user us ON sitevisithistory.fieldpersonid = us.id
                      LEFT JOIN ${schema_name}.property inventory ON sitevisithistory.siteid = inventory.id
                      LEFT JOIN public.user cu ON cu.Id = ${schema_name}.sitevisithistory.createdbyid
                      LEFT JOIN public.user mu ON mu.Id = ${schema_name}.sitevisithistory.lastmodifiedbyid
                      LEFT JOIN ${schema_name}.propertydetails areadetails ON ${schema_name}.sitevisithistory.id = areadetails.propertyid 
                      AND areadetails.type = 'area'
                    LEFT JOIN ${schema_name}.propertydetails heightdetails ON ${schema_name}.sitevisithistory.id = heightdetails.propertyid 
                      AND heightdetails.type = 'height'
                      LEFT JOIN ${schema_name}.pricingorrental pricingorrental ON ${schema_name}.sitevisithistory.id = pricingorrental.parentid 
                 `;
  console.log("query *==>", query);

  if (filter) {
    query = query + " WHERE " + filter;
  }
  query += ` group by sitevisithistory.id, cu.firstname, cu.lastname, mu.firstname, mu.lastname,us.firstname,us.lastname,inventory.name`;

  if (order) {
    query = query + " ORDER BY " + order;
  }
  return query;
};

//....................................... create sitevisithistory.........................................
async function create(newsitevisithistory, userid) {
  console.log('newsitevisithistory *==>',newsitevisithistory)
  delete newsitevisithistory.id
  console.log(validator.isUUID(newsitevisithistory.siteid ? newsitevisithistory.siteid : ''))
  const result = await sql.query(
    `INSERT INTO ${this.schema}.sitevisithistory(title, status, description, fieldpersonid, siteid, createdbyid, lastmodifiedbyid, targetdate, checkintime, checkouttime, checkinlattitude, checkinlongitude, checkoutlattitude, checkoutlongitude, remarks, location, sitename,ownername,owneractnumber,secondcontactpersonname,email,propertytype,propertyapprovalstatus,floormapavailable,firenocavailble,nooffloor,propertyarea,eachfloorheight,frontage,noofentries,liftavailable,parkingspace,previousbrand,locationarea,expectedrent,secondcontactpersonphone)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36) RETURNING *`,
    [
      newsitevisithistory.title,
      newsitevisithistory.status,
      newsitevisithistory.description,
      newsitevisithistory.fieldpersonid,
      validator.isUUID(newsitevisithistory.siteid ? newsitevisithistory.siteid : '') ? newsitevisithistory.siteid : null,
      userid,
      userid,
      newsitevisithistory.targetdate,
      newsitevisithistory.checkintime,
      newsitevisithistory.checkouttime,
      newsitevisithistory.checkinlattitude,
      newsitevisithistory.checkinlongitude,
      newsitevisithistory.checkoutlattitude,
      newsitevisithistory.checkoutlongitude,
      newsitevisithistory.remarks,
      newsitevisithistory.location,
      newsitevisithistory.sitename,
      newsitevisithistory.ownername,
      newsitevisithistory.owneractnumber,
      newsitevisithistory.secondcontactpersonname,
      newsitevisithistory.email,
      newsitevisithistory.propertytype,
      newsitevisithistory.propertyapprovalstatus,
      newsitevisithistory.floormapavailable,
      newsitevisithistory.firenocavailble,
      newsitevisithistory.nooffloor,
      newsitevisithistory.propertyarea,
      newsitevisithistory.eachfloorheight,
      newsitevisithistory.frontage,
      newsitevisithistory.noofentries,
      newsitevisithistory.liftavailable,
      newsitevisithistory.parkingspace,
      newsitevisithistory.previousbrand,
      newsitevisithistory.locationarea,
      newsitevisithistory.expectedrent,
      newsitevisithistory.secondcontactpersonphone
    ]
  )
  if (result.rowCount > 0) {
    const SiteVisitHistoryId = result.rows[0].id;
    // const detailsArray = [...newsitevisithistory.areadetails, ...newsitevisithistory.heightdetails];
    // console.log("detailsArray *==>", detailsArray);

    let pricingorrentaldetails;
    let areadetails;
    let heightdetails;
    let  detailsArray ;
    console.log("detailsArray *==>", detailsArray);
    if(newsitevisithistory.areadetails != null && Array.isArray(newsitevisithistory.areadetails) && newsitevisithistory.areadetails.length > 0){
      console.log('inside if areadetails ==>');
      detailsArray = [...newsitevisithistory.areadetails];
    }
    if(newsitevisithistory.heightdetails != null && Array.isArray(newsitevisithistory.heightdetails) && newsitevisithistory.heightdetails.length > 0){
      detailsArray = [...detailsArray,...newsitevisithistory.heightdetails];
    }
    console.log("detailsArray  after*==>", detailsArray);

    if(detailsArray){
    // Insert property details with siteVisitHistoryId as the parentId
    const propertyDetailsPromises = detailsArray?.map(async (details) => {
      console.log("inside map");
      console.log("details *==>", details);
      details.propertyid = SiteVisitHistoryId;
      const propertyDetailsQuery = buildInsertQuery(
        details,
        this.schema,
        "propertydetails"
      );
      //console.log('propertyDetailsQuery *==>',propertyDetailsQuery);
      const propertyDetailsResult = await sql.query(
        propertyDetailsQuery.query,
        propertyDetailsQuery.values
      );
      //console.log("propertyDetailsResult *==>", propertyDetailsResult.rows);

      return propertyDetailsResult.rows[0];
    });
    console.log("propertyDetailsPromises *==>", propertyDetailsPromises);

    const propertyDetailsResults = await Promise.all(propertyDetailsPromises);
    console.log("propertyDetailsResults *==>", propertyDetailsResults);

    areadetails = propertyDetailsResults.filter(
      (detail) => detail.type === "area"
    );
    console.log("areadetails *==>", areadetails);
     heightdetails = propertyDetailsResults.filter(
      (detail) => detail.type === "height"
    );
    console.log("heightdetails *==>", heightdetails);
  }

      // Insert PricingOrRental Details with  parentId

      const newPricingDetails = newsitevisithistory.pricingorrental;
      console.log("newPricingDetails *==>", newPricingDetails);

    if(newPricingDetails != null && Array.isArray(newPricingDetails) && newPricingDetails.length > 0){
      const pricingOrRentalDetailsPromises = newPricingDetails.map(async (details) => {
        console.log("details *==>", details);
        details.parentid = SiteVisitHistoryId;
        const pricingOrRentalDetailsQuery = buildInsertQuery(details, this.schema, 'pricingorrental');
        const pricingOrRentalDetailsResult = await sql.query(pricingOrRentalDetailsQuery.query, pricingOrRentalDetailsQuery.values);

        return pricingOrRentalDetailsResult.rows[0];
      });

       pricingorrentaldetails = await Promise.all(pricingOrRentalDetailsPromises);
  console.log("pricingorrentaldetails *==>", pricingorrentaldetails);
    }

    await sql.query("COMMIT");

    let siteVisitHistory = result.rows[0];
    console.log("siteVisitHistory *==>", siteVisitHistory);

    const response = {
      ...siteVisitHistory,
      areadetails,
      heightdetails,
      pricingorrentaldetails
    };
    console.log("response *==>", response);
    return response;
  }
  return null
}


function buildInsertQuery(data, schema_name, table_name) {
  const columns = Object.keys(data);
  const placeholders = columns.map((col, index) => `$${index + 1}`);

  const insertQuery = `INSERT INTO ${schema_name}.${table_name} (${columns.join(
    ", "
  )}) VALUES (${placeholders.join(", ")}) RETURNING *`;

  return {
    query: insertQuery,
    values: columns.map((col) => data[col]),
  };
}

//.....................................find sitevisithistory by id........................................
async function findById(id) {
  console.log("id *==>", id);
  let filter = ` sitevisithistory.id = '${id}'`;
  console.log("filter *==>", filter);
  console.log("this schema *==>", this.schema);

  let itemQuery = selectByIdQuery(this.schema, filter);
  console.log("itemQuery *==>", itemQuery);

  try {
    const result = await sql.query(itemQuery);
    if (result.rows.length > 0) {
      const processedResult = result.rows.map(row => {
        return {
          ...row,
          areadetails: row.areadetails[0] === null ? null : row.areadetails,
          heightdetails: row.heightdetails[0] === null ? null : row.heightdetails,
          pricingorrental: row.pricingorrental[0] === null ? null : row.pricingorrental
        };
      });
      return processedResult[0];
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

//.......................................find all sitevisithistory................................
async function findAll() {
  let itemQuery = selectByIdQuery(this.schema, undefined, `createddate DESC `);
  const result = await sql.query(itemQuery);
  const processedResult = result.rows.map(row => {
    return {
      ...row,
      areadetails: row.areadetails[0] === null ? null : row.areadetails,
      heightdetails: row.heightdetails[0] === null ? null : row.heightdetails,
      pricingorrental: row.pricingorrental[0] === null ? null : row.pricingorrental
    };
  });
  return processedResult;
}


//..............................................Update sitevisithistory................................
async function updateById(id, newsitevisithistory, newAreaDetails, newHeightDetails,newPricingDetails, userid) {
  delete newsitevisithistory.id
  newsitevisithistory["lastmodifiedbyid"] = userid
  const query = buildUpdateQuery(id, newsitevisithistory, this.schema)
  // Turn req.body into an array of values
  var colValues = Object.keys(newsitevisithistory).map(function (key) {
    return newsitevisithistory[key]
  })

  let tempPropDetailsResult = [];
  console.log('query:', query);
  console.log("file: sitevisithistory.model.js:78 - updateById - colValues - ", colValues)
  const result = await sql.query(query, colValues)
  console.log('result *==>',result);
  if (result.rowCount > 0) {
    console.log("rows *==>", result.rows);
    // const detailsArray = [...newAreaDetails, ...newHeightDetails];
    // console.log("detailsArray *==>", detailsArray);

    let pricingOrRentalDetails;
    let areadetails;
    let heightdetails;
    let  detailsArray ;
    console.log("detailsArray *==>", detailsArray);
    if(newAreaDetails != null && Array.isArray(newAreaDetails) && newAreaDetails.length > 0){
      console.log('inside if areadetails ==>');
      detailsArray = [...newAreaDetails];
    }
    if( newHeightDetails != null && Array.isArray(newHeightDetails) &&  newHeightDetails.length > 0){
      detailsArray = [...detailsArray,...newHeightDetails];
    }
    console.log("detailsArray  after*==>", detailsArray);

    if(detailsArray){

    const propertyDetailsPromises = detailsArray.map(async (details) => {
      console.log("details *==>", details);
      details.propertyid = id;
      if (details.id) {
        const propertyDetailsQuery = buildUpdateQuery(
          details.id,
          details,
          this.schema,
          "propertydetails"
        );

        console.log("Property details update query:", propertyDetailsQuery);
        var colval = Object.keys(details).map(function (key) {
          return details[key];
        });
        console.log("colval", colval);
        const propertyDetailsResult = await sql.query(
          propertyDetailsQuery,
          colval
        );
        console.log('propertyDetailsResult *==>',propertyDetailsResult);
        tempPropDetailsResult.push(propertyDetailsResult.rows[0]);

        return propertyDetailsResult.rows[0] || {}; // Return an empty object if propertyDetailsResult.rows[0] is null
      } else {
        const propertyDetailsQuery = buildInsertQuery(
          details,
          this.schema,
          "propertydetails"
        );
        const propertyDetailsResult = await sql.query(
          propertyDetailsQuery.query,
          propertyDetailsQuery.values
        );
        return propertyDetailsResult.rows[0] || {};
      }
    });

    const propertyDetailsResults = await Promise.all(propertyDetailsPromises);
    console.log('propertyDetailsResults *==>',propertyDetailsResults);

    areadetails = propertyDetailsResults.filter(
      (detail) => detail.type === "area"
    );
    console.log("areadetails *==>", areadetails);
     heightdetails = propertyDetailsResults.filter(
      (detail) => detail.type === "height"
    );
    console.log("heightdetails *==>", heightdetails);
  }

     //
     if(newPricingDetails != null && Array.isArray(newPricingDetails) && newPricingDetails.length > 0){
     const pricingOrRentalDetailsPromises = newPricingDetails.map(async (details) => {
      console.log("details *==>", details);
      details.parentid = id;
      if (details.id) {
        const pricingOrRentalDetailsQuery = buildUpdateQuery(
          details.id,
          details,
          this.schema,
          "pricingorrental"
        );

        console.log("pricingOrRentalDetailsQuery *==>", pricingOrRentalDetailsQuery);
        console.log(
          "pricingOrRentalDetailsQuery values *==>",
          pricingOrRentalDetailsQuery.values
        );
        var colval = Object.keys(details).map(function (key) {
          return details[key];
        });
        console.log("colval", colval);
        const pricingOrRentalDetailsResult = await sql.query(
          pricingOrRentalDetailsQuery,
          colval
        );

        tempPropDetailsResult.push(pricingOrRentalDetailsResult.rows[0]);

        return pricingOrRentalDetailsResult.rows[0] || {}; // Return an empty object if propertyDetailsResult.rows[0] is null
      } else {
        const pricingOrRentalDetailsResultQuery = buildInsertQuery(
          details,
          this.schema,
          "pricingorrental"
        );
        const  pricingOrRentalDetailsResult = await sql.query(
          pricingOrRentalDetailsResultQuery.query,
          pricingOrRentalDetailsResultQuery.values
        );
        return pricingOrRentalDetailsResult.rows[0] || {};
      }
    });

     pricingOrRentalDetails = await Promise.all(pricingOrRentalDetailsPromises);
  }

    const response = {
      ...newsitevisithistory,
      areadetails,
     heightdetails,
     pricingOrRentalDetails
    };
    console.log("response *==>", response);
    return response;
  }
  return null
}

//.....................................................Delete sitevisithistory...........................
async function deletesitevisithistory(id) {
  const result = await sql.query(
    `DELETE FROM ${this.schema}.sitevisithistory WHERE id = $1`,
    [id]
  )
  //const result = await sql.query("DELETE FROM public.sitevisithistory ");
  if (result.rowCount > 0) return "Success"
  return null
}

async function findCurrentRecordByUserId(staffId) {
  const query = `SELECT * FROM ${this.schema}.sitevisithistory WHERE parentid = $1 order by checkintime desc limit 1`
  const result = await sql.query(query, [staffId])
  if (result.rows.length > 0) {
    return result.rows[0]
  }
  return null
}

async function getStaffLoginHistory(staffId) {
  const query = `SELECT * FROM ${this.schema}.sitevisithistory WHERE parentid = $1 order by checkintime DESC`
  const result = await sql.query(query, [staffId])
  ////console.log('result.rows.length===>',result.rows.length);
  if (result.rows) {
    return result.rows
  }
  return null
}

function buildUpdateQuery(id, cols, schema, tableName) {
  // Setup static beginning of query\
  delete cols.id;
  var query = [`UPDATE ${schema}.${tableName || "sitevisithistory"} `];
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
  findById,
  findAll,
  create,
  deletesitevisithistory,
  updateById,
  findCurrentRecordByUserId,
  getStaffLoginHistory,
  init,
}
