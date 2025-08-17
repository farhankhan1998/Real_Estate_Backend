const sql = require("./db.js");

let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}

// const selectByIdQuery = (schema_name, filter, order) => {
//   let query = `SELECT property.*, CONCAT(contact.firstname, ' ' , contact.lastname) AS contactname, CONCAT(cu.firstname, ' ' , cu.lastname) AS createdbyname, CONCAT(mu.firstname, ' ' , mu.lastname) AS lastmodifiedbyname, CONCAT(owner.firstname, ' ' , owner.lastname) AS ownername FROM ${schema_name}.property `;
//   query += ` LEFT JOIN public.user cu ON cu.Id = ${schema_name}.property.createdbyid `;
//   query += ` LEFT JOIN public.user mu ON mu.Id = ${schema_name}.property.lastmodifiedbyid `;
//   query += ` LEFT JOIN public.user owner ON owner.Id = ${schema_name}.property.ownerid `;
//   query += ` LEFT JOIN ${schema_name}.contact contact ON contact.Id = ${schema_name}.property.contactid `;

//   if (filter) {
//     query = query + " WHERE " + filter;
//   }
//   if (order) {
//     query = query + " ORDER BY " + order;
//   }
//   return query;
// };
const selectByIdQuery = (schema_name, filter, order) => {
  let query = `SELECT property.*,
                        CONCAT(property.street, ', ' , property.city, ', ' , property.state) AS Address, 
                        CONCAT(contact.firstname, ' ' , contact.lastname) AS contactname, 
                        CONCAT(cu.firstname, ' ' , cu.lastname) AS createdbyname, 
                        CONCAT(mu.firstname, ' ' , mu.lastname) AS lastmodifiedbyname, 
                        CONCAT(owner.firstname, ' ' , owner.lastname) AS ownername,
                        json_agg(DISTINCT areadetails.*) AS areadetails, 
                        json_agg(DISTINCT heightdetails.*) AS heightdetails,
                        json_agg(DISTINCT pricingorrental.*) AS pricingorrental,
                        CASE 
                            WHEN COUNT(areadetails.*) = 0 THEN NULL
                            ELSE STRING_AGG(DISTINCT CONCAT(areadetails.floor, ' - ', areadetails.value, ' ', areadetails.unit), ',\n')
                        END AS areadetail_summary,
                        CASE 
                            WHEN COUNT(heightdetails.*) = 0 THEN NULL
                            ELSE STRING_AGG(DISTINCT CONCAT(heightdetails.floor, ' - ', heightdetails.value, ' ', heightdetails.unit), ',\n')
                        END AS heightdetail_summary,
                        CASE 
                            WHEN COUNT(pricingorrental.*) = 0 THEN NULL
                            ELSE STRING_AGG(DISTINCT CONCAT(
                                pricingorrental.floorno, ' - ', 
                                CASE 
                                    WHEN pricingorrental.type = 'rent' THEN pricingorrental.rentalvalue 
                                    WHEN pricingorrental.type = 'pricing' THEN pricingorrental.perunitcost 
                                END, ' ', 
                                pricingorrental.unit), ',\n')
                        END AS pricingorrentaldetail_summary
                FROM ${schema_name}.property
                LEFT JOIN public.user cu ON cu.Id = ${schema_name}.property.createdbyid
                LEFT JOIN public.user mu ON mu.Id = ${schema_name}.property.lastmodifiedbyid
                LEFT JOIN public.user owner ON owner.Id = ${schema_name}.property.ownerid
                LEFT JOIN ${schema_name}.contact contact ON contact.Id = ${schema_name}.property.contactid
                LEFT JOIN ${schema_name}.propertydetails areadetails ON ${schema_name}.property.id = areadetails.propertyid 
                AND areadetails.type = 'area'
              LEFT JOIN ${schema_name}.propertydetails heightdetails ON ${schema_name}.property.id = heightdetails.propertyid 
                AND heightdetails.type = 'height' 
                LEFT JOIN ${schema_name}.pricingorrental pricingorrental ON ${schema_name}.property.id = pricingorrental.parentid 
               `;

  if (filter) {
    query = query + " WHERE " + filter;
  }
  query += ` GROUP BY property.id, contact.firstname, contact.lastname, cu.firstname, cu.lastname, mu.firstname, mu.lastname, owner.firstname, owner.lastname`;
  if (order) {
    query = query + " ORDER BY " + order;
  }

  return query;
};


//....................................... create property.........................................
async function create(newProperty, newAreaDetails,newHeightDetails, newPricingDetails, userid) {
  let resultResponse = {};
  console.log(' newProperty*==>',newProperty)
  console.log(' newAreaDetails*==>',newAreaDetails)
  console.log(' newPricingDetails*==>',newPricingDetails)


  // console.log(' newHeightDetails*==>',newHeightDetails)

  try {
    // await sql.query("BEGIN");

    const existingProperty = await sql.query(`SELECT id FROM ${this.schema}.property WHERE name = $1`, [newProperty.name]);
    if (existingProperty.rows.length > 0) {
      return {error : 'Property Name Already Exists'}
    } else {
    // Insert property
    const propertyQuery = buildInsertQuery(newProperty, this.schema, 'property');
    const propertyResult = await sql.query(propertyQuery.query, propertyQuery.values);
    console.log('propertyResult',propertyResult.rows);
    if (propertyResult.rows.length > 0) {
      const propertyId = propertyResult.rows[0].id;
      
      let pricingorrentaldetails;
      let areadetails;
      let heightdetails;
      let  detailsArray ;
      console.log("detailsArray *==>", detailsArray);
      if(newAreaDetails != null && Array.isArray(newAreaDetails) &&newAreaDetails.length > 0){
        console.log('inside if areadetails ==>');
        detailsArray = [...newAreaDetails];
      }
      if(newHeightDetails != null && Array.isArray(newHeightDetails) && newHeightDetails.length > 0){
        detailsArray = [...detailsArray,...newHeightDetails];
      }
      console.log("detailsArray  after*==>", detailsArray);
  
      if(detailsArray){
      // Insert property details with propertyId as the parentId
      const propertyDetailsPromises = detailsArray.map(async (details) => {
        console.log("details *==>", details);
        details.propertyid = propertyId;
        const propertyDetailsQuery = buildInsertQuery(details, this.schema, 'propertydetails');
        const propertyDetailsResult = await sql.query(propertyDetailsQuery.query, propertyDetailsQuery.values);

        return propertyDetailsResult.rows[0];
      });

      const propertyDetailsResults = await Promise.all(propertyDetailsPromises);

      areadetails = propertyDetailsResults.filter(
        (detail) => detail.type === "area"
      );
      console.log("areadetails *==>", areadetails);
       heightdetails = propertyDetailsResults.filter(
        (detail) => detail.type === "height"
      );
      console.log("heightdetails *==>", heightdetails);
    }

    if(newPricingDetails != null && Array.isArray(newPricingDetails) && newPricingDetails.length > 0){
            // Insert PricingOrRental Details with  parentId
            const pricingOrRentalDetailsPromises = newPricingDetails.map(async (details) => {
              console.log("details *==>", details);
              console.log("details type*==>", details.type);
              // if(details.type != ''){
                console.log('inside if details type *==>');
              details.parentid = propertyId;
              const pricingOrRentalDetailsQuery = buildInsertQuery(details, this.schema, 'pricingorrental');
              const pricingOrRentalDetailsResult = await sql.query(pricingOrRentalDetailsQuery.query, pricingOrRentalDetailsQuery.values);
      
              return pricingOrRentalDetailsResult.rows[0];
              // }
            });
      
             pricingorrentaldetails = await Promise.all(pricingOrRentalDetailsPromises);
        console.log("pricingorrentaldetails *==>", pricingorrentaldetails);
          }

      await sql.query("COMMIT");
      let property = propertyResult.rows[0];
      console.log("property *==>", property);
      const response = {
        ...property,
        areadetails,
        heightdetails,
        pricingorrentaldetails
      };
      console.log("response *==>", response);
      return response;
    }

     await sql.query("ROLLBACK");
  }
  } catch (error) {
    console.log(error);
     await sql.query("ROLLBACK");
  }

  return null;
}


// async function create(newProperty, newPropertyDetails,newHeightDetails, userid) {
//   let resultResponse = {};
//   console.log(' newProperty*==>',newProperty)
//   console.log(' newHeightDetails*==>',newHeightDetails)

//   try {
//     await sql.query("BEGIN");

//     // Insert property
//     const propertyQuery = buildInsertQuery(newProperty, this.schema, 'property');
//     const propertyResult = await sql.query(propertyQuery.query, propertyQuery.values);
//     console.log('propertyResult',propertyResult.rows);
//     if (propertyResult.rows.length > 0) {
//       const propertyId = propertyResult.rows[0].id;
      
//       // const detailsArray = [...newPropertyDetails,...newHeightDetails];
//       // console.log("detailsArray *==>", detailsArray);

//       // Insert property details with propertyId as the parentId
//       const propertyDetailsPromises = newPropertyDetails.map(async (details) => {
//         console.log("details *==>", details);
//         details.propertyid = propertyId;
//         const propertyDetailsQuery = buildInsertQuery(details, this.schema, 'propertydetails');
//         const propertyDetailsResult = await sql.query(propertyDetailsQuery.query, propertyDetailsQuery.values);

//         return propertyDetailsResult.rows[0];
//       });

//       const propertyDetailsResults = await Promise.all(propertyDetailsPromises);

//           // Insert Height details with propertyId as the parentId
//           const heightDetailsPromises = newHeightDetails.map(async (details) => {
//             console.log("details *==>", details);
//             details.propertyid = propertyId;
//             const propertyDetailsQuery = buildInsertQuery(details, this.schema, 'propertydetails');
//             const propertyDetailsResult = await sql.query(propertyDetailsQuery.query, propertyDetailsQuery.values);
    
//             return propertyDetailsResult.rows[0];
//           });
    
//           const heightDetailsResults = await Promise.all(heightDetailsPromises);

//       await sql.query("COMMIT");
      
//       let property = propertyResult.rows[0];
//       console.log("property *==>", property);
//       const areadetails = propertyDetailsResults.filter(
//         (detail) => detail.type === "area"
//       );
//       console.log("areadetails *==>", areadetails);
//       const heightdetails = heightDetailsResults.filter(
//         (detail) => detail.type === "height"
//       );
//       console.log("heightdetails *==>", heightdetails);
  
//       const response = {
//         ...property,
//         areadetails,
//         heightdetails,
//       };
//       console.log("response *==>", response);
//       return response;
//     }

//     await sql.query("ROLLBACK");
//   } catch (error) {
//     console.log(error);
//     await sql.query("ROLLBACK");
//   }

//   return null;
// }

function buildInsertQuery(data, schema_name, table_name) {
  console.log('data *==>',data)
  console.log('schema_name *==>',schema_name)
  console.log('table_name *==>',table_name)

  const columns = Object.keys(data);
  const placeholders = columns.map((col, index) => `$${index + 1}`);
  console.log('placeholders *==>',placeholders)
  
  const insertQuery = `INSERT INTO ${schema_name}.${table_name} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`;
  console.log('insertQuery *==>',insertQuery)
  return {
    query: insertQuery,
    values: columns.map((col) => data[col]),
  };
}
//....................................... create property from the FB Ads............................................
async function createFB(newProperty, userid) {
  //delete newProperty.id;
  console.log("===model area==");
  try {
    const { legacyid, pageid, formid, adid, FULL_NAME, EMAIL, PHONE } =
      newProperty;

    var firstName = FULL_NAME.split(" ").slice(0, -1).join(" ");
    var lastName = FULL_NAME.split(" ").slice(-1).join(" ");

    const result = await sql.query(
      `INSERT INTO ${this.schema}.property (firstname, lastname, email, phone, pageid, formid, adid, legacyid, propertysource, ownerid, createdbyid, lastmodifiedbyid)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
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
      return { id: result.rows[0].id, ...newProperty };
    }
  } catch (error) {
    console.log("===model==" + JSON.stringify(error));
  }

  return null;
}

// .....................................find property by id........................................
async function findById(id) {
  console.log("id *==>", id);
  let filter = ` property.id = '${id}'`;
  console.log("filter *==>", filter);
  console.log("this schema *==>", this.schema);

  let itemQuery = selectByIdQuery(this.schema, filter);
  console.log("itemQuery *==>", itemQuery);

  try {
    const result = await sql.query(itemQuery);
    if (result.rows.length > 0) {
      const processedResult = result.rows.map(row => {
        console.log('row *==>',row);
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
//.....................................find property by ownerId....................................
async function findByOwnerId(id) {
  //console.log("id ", id);
  //const result = await sql.query(`SELECT * FROM property WHERE ownerid = $1`,[id]);
  let query = `SELECT ${this.schema}.property.*,  concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, concat(owner.firstname, ' ' , owner.lastname) ownername  FROM ${this.schema}.property `;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.property.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.property.lastmodifiedbyid `;
  query += ` INNER JOIN public.user owner ON owner.Id = ${this.schema}.property.ownerid `;

  const result = await sql.query(
    query + ` WHERE ${this.schema}.property.ownerid = $1`,
    [id]
  );
  if (result.rows.length > 0) return result.rows;

  return null;
}

//.......................................find all property................................
async function findAll(title) {
  let itemQuery;
  if (title) {
    itemQuery = selectByIdQuery(
      this.schema,
      `property.title LIKE '%${title}%'`,
      `createddate DESC `
    );
    console.log("itemQuery*==>", itemQuery);
  } else {
    itemQuery = selectByIdQuery(this.schema, undefined, `createddate DESC `);
  }
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



//..............................................Update Property................................
// async function updateById(id, newProperty, newPropertyDetails, userid) {
//   console.log('newProperty *==>',newProperty);
//   console.log('newPropertyDetails *==>',newPropertyDetails);

//   try {
//     //await sql.query("BEGIN");

//     // Log data for debugging
//     console.log("Updating property with ID:", id);
//     console.log("New property data:", newProperty);

//     // Update property
//     const propertyQuery = buildUpdateQuery(id, newProperty, this.schema);
//     console.log("Property update query:", propertyQuery.query);
//     console.log("Property update values:", propertyQuery.values);

//     const propertyResult = await sql.query(propertyQuery.query, propertyQuery.values);
//     console.log("propertyResult *==>", propertyResult.rows);

//     let tempPropDetailsResult = []

//     if (propertyResult.rowCount > 0) {
//       // console.log("rows *==>", propertyResult.rows);
//       // const detailsArray = [...newAreaDetails, ...newHeightDetails];
//       // console.log("detailsArray *==>", detailsArray);

//       const propertyDetailsPromises = newPropertyDetails.map(async (details) => {
//         console.log('details *==>',details)
//         if (details.id) {
//         const propertyDetailsQuery = buildUpdateQuery(details.id, details, this.schema, 'propertydetails');
//         console.log("Property details update query:", propertyDetailsQuery.query);
//         console.log("Property details update values:", propertyDetailsQuery.values);

//         const propertyDetailsResult = await sql.query(propertyDetailsQuery.query, propertyDetailsQuery.values);

//         tempPropDetailsResult.push(propertyDetailsResult.rows[0])

//         return propertyDetailsResult.rows[0] || {}; // Return an empty object if propertyDetailsResult.rows[0] is null
//       }else {
//         const propertyDetailsQuery = buildInsertQuery(details, this.schema, 'propertydetails');
//         const propertyDetailsResult = await sql.query(propertyDetailsQuery.query, propertyDetailsQuery.values);
//         return propertyDetailsResult.rows[0] || {};
//       }
//       });
      
//       const propertyDetailsResults = await Promise.all(propertyDetailsPromises);
//       console.log('propertyDetailsResults *==>',propertyDetailsResults)
//       //await sql.query("COMMIT");

//       let property = propertyResult.rows[0];
//       console.log("property *==>", property);
//       const areadetails = propertyDetailsResults.filter(
//         (detail) => detail.type === "area"
//       );
//       console.log("areadetails *==>", areadetails);
//       const heightdetails = propertyDetailsResults.filter(
//         (detail) => detail.type === "height"
//       );
//       console.log("heightdetails *==>", heightdetails);
  
//       const response = {
//         ...property,
//         areadetails,
//         heightdetails,
//       };
//       console.log("response *==>", response);
//       return response;

//     }

//    // await sql.query("ROLLBACK");
//   } catch (error) {
//     console.log("Error during update:", error);
//     //await sql.query("ROLLBACK");
//   }
//   return null;
// }

async function updateById(
  id,
  newProperty,
  newAreaDetails,
  newHeightDetails,
  newPricingDetails,
  userid
) {
  console.log("id *==>", id);
  console.log("newAreaDetails *==>", newAreaDetails);
  console.log("newHeightDetails *==>", newHeightDetails);
  console.log("newPricingDetails *==>", newPricingDetails);

  delete newProperty.id;
  newProperty["lastmodifiedbyid"] = userid;

  const existingProperty = await sql.query(`SELECT id FROM ${this.schema}.property WHERE name = $1`, [newProperty.name]);
  console.log("existingProperty *==>", existingProperty);

  let existingPropertyID ;
  if(existingProperty.rowCount > 0){
    console.log("existingProperty rows[0].id*==>", existingProperty.rows[0].id);
    existingPropertyID = existingProperty.rows[0].id;
  }

  if (existingProperty.rows.length > 0 && existingPropertyID != id ) {
    return {error : 'Property Name Already Exists'}
  } else {
  const query = buildUpdateQuery(id, newProperty, this.schema);
  // Turn req.body into an array of values
  var colValues = Object.keys(newProperty).map(function (key) {
    return newProperty[key];
  });

 // console.log("query:", query, newAreaDetails);

  let tempPropDetailsResult = [];
  console.log("q -", query);
  console.log("colValues", colValues);
  // const result = await sql.query(query, colValues);
  // const result = await sql.query(query);
  const result = await sql.query({
    text: query.query,
    values: colValues
  });

  console.log("result *==>", result.rows);

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
        console.log(
          "Property details update values:",
          propertyDetailsQuery.values
        );
        var colval = Object.keys(details).map(function (key) {
          return details[key];
        });
        console.log("colval", colval);
        const propertyDetailsResult = await sql.query(
          propertyDetailsQuery.query,
          propertyDetailsQuery.values
        );

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
          pricingOrRentalDetailsQuery.query,
          pricingOrRentalDetailsQuery.values
        );

        tempPropDetailsResult.push(pricingOrRentalDetailsResult.rows[0]);

        return pricingOrRentalDetailsResult.rows[0] || {}; // Return an empty object if propertyDetailsResult.rows[0] is null
      } else {
        if(details.type != ''){
          console.log('inside if details type *==>');
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
    }
    });

     pricingOrRentalDetails = await Promise.all(pricingOrRentalDetailsPromises);
  }

    let property = result.rows[0];
    console.log("property *==>", property);

    const response = {
      id,
      ...newProperty,
      areadetails,
      heightdetails,
      pricingOrRentalDetails
    };
    console.log("response *==>", response);
    return response;
  }
  return null;
}
}

async function findActiveProperty(pid) {
  let query =
    "SELECT prb.*, concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, ";
  query += " pr.name FROM property prb";
  // query += " INNER JOIN product pr ON pr.id = prb.productid "
  query += " INNER JOIN public.user cu ON cu.Id = prb.createdbyid ";
  query += " INNER JOIN public.user mu ON mu.Id = prb.lastmodifiedbyid ";

  const result = await sql.query(
    query + ` WHERE prb.active=true AND pr.id = $1`,
    [pid]
  );
  if (result.rows.length > 0) return result.rows[0];

  return null;
}

async function findLeadByPropertyId(id) {
  console.log("prolead id " + id);
  let query = `SELECT con.*,concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname FROM ${this.schema}.lead con `;
  query += ` LEFT JOIN ${this.schema}.property acc ON acc.Id = con.propertyid `;
  query += ` INNER JOIN public.user cu ON cu.Id = con.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = con.lastmodifiedbyid `;
  try {
    const result = await sql.query(query + ` WHERE con.propertyid = $1`, [id]);
    if (result.rows.length > 0) return result.rows;
  } catch (error) {
    console.log(error);
  }
  return null;
}
// .....................................................Delete property and related details..
async function deleteProperty(id) {
  try {
    await sql.query("BEGIN");

    // Delete related propertydetails first
    await sql.query(
      `DELETE FROM ${this.schema}.propertydetails WHERE propertyid = $1`,
      [id]
    );

    // Delete property
    const result = await sql.query(
      `DELETE FROM ${this.schema}.property WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount > 0) {
      await sql.query("COMMIT");
      return "Success";
    }

    await sql.query("ROLLBACK");
  } catch (error) {
    console.error(error);
    await sql.query("ROLLBACK");
  }

  return null;
}

function buildUpdateQuery(id, cols, schema, tableName) {
  // Setup static beginning of query
  var query = [`UPDATE ${schema}.${tableName || 'property'} `];
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

  // Add the RETURNING clause to get the updated values
  query.push("RETURNING *");

  // Return a complete query string
  return {
    query: query.join(" "),
    values: Object.values(cols),
  };
}

async function findAllPublicProperty() {
  //let query = "SELECT * FROM property";

  let query = `SELECT prop.*,  concat(owner.firstname, ' ' , owner.lastname) ownername , owner.phone ownerphone, owner.email owneremail, `;
  // query += ` (SELECT concat(prd.id, '/' , id , '.', fileType) files
  query += `(SELECT string_agg('{ "Id" : "' || ID || '"@#"title" : "' || TITLE || '"@#"fileType" : "' || fileType || '"}',', ') files 
  FROM  ${this.schema}.FILE file
            WHERE documenttype = 'property_image' and file.PARENTID = prop.Id)`;
  query += ` FROM ${this.schema}.property prop`;
  query += ` LEFT JOIN public.user owner ON owner.Id = prop.ownerid `;
  // query += ` Where prop.showonweb = true`;
  query += ` ORDER BY prop.createddate DESC`;

  const result = await sql.query(query);
  //console.log('rows:===>', result.rows);
  return result.rows;
}

module.exports = {
  init,
  findById,
  updateById,
  findAll,
  create,
  findActiveProperty,
  findLeadByPropertyId,
  deleteProperty,
  findByOwnerId,
  createFB,
  findAllPublicProperty,
};
