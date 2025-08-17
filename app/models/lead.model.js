const leadRoutes = require("../routes/lead.routes.js");
const constants = require("../constants/global.js");
const sql = require("./db.js");
let schema = "";
function init(schema_name) {
  this.schema = schema_name;
}

const selectByIdQuery = (schema_name, filter, order) => {
  let query = `select lead.*,
  CONCAT(cu.firstname, ' ' , cu.lastname) AS createdbyname, 
  CONCAT(mu.firstname, ' ' , mu.lastname) AS lastmodifiedbyname, 
  CONCAT(owner.firstname, ' ' , owner.lastname) AS ownername,
  json_agg(DISTINCT areadetails.*) as areadetails, json_agg(DISTINCT heightdetails.*) as heightdetails,
  json_agg(DISTINCT pricingorrental.*) as pricingorrental
FROM ${schema_name}.lead
LEFT JOIN public.user cu ON cu.Id = ${schema_name}.lead.createdbyid
LEFT JOIN public.user mu ON mu.Id = ${schema_name}.lead.lastmodifiedbyid
LEFT JOIN public.user owner ON owner.Id = ${schema_name}.lead.ownerid
LEFT JOIN ${schema_name}.propertydetails areadetails ON ${schema_name}.lead.id = areadetails.propertyid 
AND areadetails.type = 'area'
LEFT JOIN ${schema_name}.propertydetails heightdetails ON ${schema_name}.lead.id = heightdetails.propertyid 
AND heightdetails.type = 'height'
LEFT JOIN ${schema_name}.pricingorrental pricingorrental ON ${schema_name}.lead.id = pricingorrental.parentid 
`;
// console.log("query *==>", query);

  if (filter) {
    query = query + " WHERE " + filter;
  }
  query += ` group by lead.id, cu.firstname, cu.lastname, mu.firstname, mu.lastname, owner.firstname, owner.lastname`;

  if (order) {
    query = query + " ORDER BY " + order;
  }
  return query;
};

//....................................... create lead.........................................
async function create(newLead, userid) {
  console.log('newLead *==>',newLead)
  console.log('newLead areadetails*==>',newLead.areadetails)
  console.log('newLead heightdetails*==>',newLead.heightdetails)

  delete newLead.id;

  const result = await sql.query(
    `INSERT INTO ${this.schema}.lead (
      firstname, lastname,  salutation, designation, email, phone, alternatephone,
      clientstreet, clientcity, clientstate, clientcountry, clientpincode, clientcalloption, clientcalloptionemail, 
      clientcalloptionname, clientcalloptionmobile, clientcalloptiondate, clientcalloptionremark, clientcalloptionratepersqfeet, 
      clientcalloptionbrokerage, transactiontype, typeofclient, vertical, verticaltype, subverticaltype, zone, type, otherlocations, otherdetails, 
      areaorlocationbrief, completiondate,  ownerid, lastmodifiedbyid, createdbyid,leadsource,leadstage, company, noofdocksvalue,
      noofwashroomsvalue,openareaunit,openareavalue,  closeareaunit,  closeareavalue,rentalunit, rentalvalue,clienttype,
      retailsubvertical, typeofwarehouse, floor, chargeablearea, offeredcarpetarea, heightside, heightcenter, typeofflooring, 
      firehydrants, firesprinkelers, firenoc, quotedrentonchargeablearea, securitydeposit, commonareamaintaince, possessionstatus, 
      addtionalinformation, project, location, totalfloors, totalbuilduparea, offeredspacedetails, flooroffered, quotedrent, maintainancecharges,
       powerbackup, powerallocation, powerbackupsystem, powerbackupcharges, othergeneralterms, proposedleaseterm, proposedlockperiod, rentescalation, 
       intrestfreesecuritydeposit, propertytax, stampdutyregistrationcharges, parkingcharges, availability, marketbrand, googlecoordinates, offeredarea, 
       frontagearea, commercialterms, heightfloor, remark, verticalname, floorplatesize, chargeableareaoffered, workinghours, status, fitoutrental,
        propertystatus, electriccharges, numberofcarortruckparking, carparkcharges, contactname, contactnumber, othertenants, officestate, officecity,
         officestreet, officepincode, officecountry,availablity,locatedin,dockheight,
         docklevel,
         advance,
         roadwidth,
         labourroom,
         guardroom,
         powerconnection,
         waterconnection,
         flooringloadingcapacity,
         noofkeys,
         architectname,
         banquetcapacity,
         noofservicelifts,
         noofcarparking,

         length,
         width,
         unit,
         plotunit,
         plotlength,
         plotwidth,
         perunitcost,
         saleablearea,
         quotedcost,
         chargeblearea,
         quotedrentpermonth,
         tenure,
         floorno,
         area,
         possessiondate,
         furnishedstatus,
         leaseexpirationdate,
         nearbywarehouses
    )  
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 
      $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, 
      $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, 
      $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, 
      $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, $84, $85, $86, $87, 
      $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98, $99, $100, $101, $102, $103, 
      $104, $105, $106, $107, $108, $109, $110, $111, $112, $113, $114, $115, $116, $117, $118, $119, $120, $121, $122, $123, $124,
       $125, $126, $127, $128, $129, $130, $131, $132, $133, $134, $135, $136, $137, $138, $139, $140, $141, $142

    ) RETURNING *`,
    [
      newLead.firstname,
      newLead.lastname,
      newLead.salutation,
      newLead.designation,
      newLead.email,
      newLead.phone,
      newLead.alternatephone,
      newLead.clientstreet,
      newLead.clientcity,
      newLead.clientstate,
      newLead.clientcountry,
      newLead.clientpincode,
      newLead.clientcalloption,
      newLead.clientcalloptionemail,
      newLead.clientcalloptionname,
      newLead.clientcalloptionmobile,
      newLead.clientcalloptiondate,
      newLead.clientcalloptionremark,
      newLead.clientcalloptionratepersqfeet,
      newLead.clientcalloptionbrokerage,
      newLead.transactiontype,
      newLead.typeofclient,
      newLead.vertical ? newLead.vertical: '' ,
      newLead.verticaltype,
      newLead.subverticaltype,
      newLead.zone,
      newLead.type,
      newLead.otherlocations,
      newLead.otherdetails,
      newLead.areaorlocationbrief,
      newLead.completiondate,
      newLead.ownerid,
      userid,
      userid,
      newLead.leadsource,
      newLead.leadstage,
      newLead.company,
      newLead.noofdocksvalue,
      newLead.noofwashroomsvalue,
      newLead.openareaunit,
      newLead.openareavalue,
      newLead.closeareaunit,
      newLead.closeareavalue,
      newLead.rentalunit,
      newLead.rentalvalue,
      newLead.clienttype,
      newLead.retailsubvertical,
      newLead.typeofwarehouse,
      newLead.floor,
      newLead.chargeablearea,
      newLead.offeredcarpetarea,
      newLead.heightside,
      newLead.heightcenter,
      newLead.typeofflooring,
      newLead.firehydrants,
      newLead.firesprinkelers,
      newLead.firenoc,
      newLead.quotedrentonchargeablearea,
      newLead.securitydeposit,
      newLead.commonareamaintaince,
      newLead.possessionstatus,
      newLead.addtionalinformation,
      newLead.project,
      newLead.location,
      newLead.totalfloors,
      newLead.totalbuilduparea,
      newLead.offeredspacedetails,
      newLead.flooroffered,
      newLead.quotedrent,
      newLead.maintainancecharges,
      newLead.powerbackup,
      newLead.powerallocation,
      newLead.powerbackupsystem,
      newLead.powerbackupcharges,
      newLead.othergeneralterms,
      newLead.proposedleaseterm,
      newLead.proposedlockperiod,
      newLead.rentescalation,
      newLead.intrestfreesecuritydeposit,
      newLead.propertytax,
      newLead.stampdutyregistrationcharges,
      newLead.parkingcharges,
      newLead.availability,
      newLead.marketbrand,
      newLead.googlecoordinates,
      newLead.offeredarea,
      newLead.frontagearea,
      newLead.commercialterms,
      newLead.heightfloor,
      newLead.remark,
      newLead.verticalname,
      newLead.floorplatesize,
      newLead.chargeableareaoffered,
      newLead.workinghours,
      newLead.status,
      newLead.fitoutrental,
      newLead.propertystatus,
      newLead.electriccharges,
      newLead.numberofcarortruckparking,
      newLead.carparkcharges,
      newLead.contactname,
      newLead.contactnumber,
      newLead.othertenants,
      newLead.officestate,
      newLead.officecity,
      newLead.officestreet,
      newLead.officepincode,
      newLead.officecountry,
      newLead.availablity,
      newLead.locatedin,
      newLead.dockheight,
      newLead.docklevel,
      newLead.advance,
      newLead.roadwidth,
      newLead.labourroom,
      newLead.guardroom,
      newLead.powerconnection,
      newLead.waterconnection,
      newLead.flooringloadingcapacity,
      newLead.noofkeys,
      newLead.architectname,
      newLead.banquetcapacity,
      newLead.noofservicelifts,
      newLead.noofcarparking,

         newLead.length,
         newLead.width,
         newLead.unit,
         newLead.plotunit,
         newLead.plotlength,
         newLead.plotwidth,
         newLead.perunitcost,
         newLead.saleablearea,
         newLead.quotedcost,
         newLead.chargeblearea,
         newLead.quotedrentpermonth,
         newLead.tenure,
         newLead.floorno,
         newLead.area,
         newLead.possessiondate,
         newLead.furnishedstatus,
         newLead.leaseexpirationdate,
         newLead.nearbywarehouses


    ]
  );
  if (result.rows.length > 0) {
    const LeadId = result.rows[0].id;

    let pricingorrentaldetails;
    let areadetails;
    let heightdetails;
    let  detailsArray ;
    console.log("detailsArray *==>", detailsArray);
    if(newLead.areadetails != null && Array.isArray(newLead.areadetails) && newLead.areadetails.length > 0){
      console.log('inside if areadetails ==>');
      detailsArray = [...newLead.areadetails];
    }
    if(newLead.heightdetails != null && Array.isArray(newLead.heightdetails) && newLead.heightdetails.length > 0){
      detailsArray = [...detailsArray,...newLead.heightdetails];
    }
    console.log("detailsArray  after*==>", detailsArray);

    if(detailsArray){
    const propertyDetailsPromises = detailsArray?.map(async (details) => {
      console.log("inside map");
      console.log("details *==>", details);
      details.propertyid = LeadId;
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

     //const newPricingDetails = newLead.pricingorrentaldetails;
    const newPricingDetails = newLead.pricingorrental;

    console.log("newPricingDetails inside*==>", newPricingDetails);
    // let  newPricingDetailsArray ;
    // console.log("detailsArray *==>", detailsArray);
    //   if(newPricingDetails != null && Array.isArray(newPricingDetails) && newPricingDetails.length > 0){
    //   newPricingDetailsArray = [...newPricingDetails];
    // }

    if(newPricingDetails != null && Array.isArray(newPricingDetails) && newPricingDetails.length > 0){
          // Insert PricingOrRental Details with  parentId
          const pricingOrRentalDetailsPromises = newPricingDetails.map(async (details) => {
            console.log("details *==>", details);
            details.parentid = LeadId;
            const pricingOrRentalDetailsQuery = buildInsertQuery(details, this.schema, 'pricingorrental');
            const pricingOrRentalDetailsResult = await sql.query(pricingOrRentalDetailsQuery.query, pricingOrRentalDetailsQuery.values);
    
            return pricingOrRentalDetailsResult.rows[0];
          });
    
           pricingorrentaldetails = await Promise.all(pricingOrRentalDetailsPromises);
      console.log("pricingorrentaldetails *==>", pricingorrentaldetails);
        }

    await sql.query("COMMIT");

    let lead = result.rows[0];
    // console.log("lead *==>", lead);


    const response = {
      ...lead,
      areadetails,
      heightdetails,
      pricingorrentaldetails
    };
    // console.log("response *==>", response);
    return response;
  }

  // if (result.rows.length > 0) {
  //   return result.rows[0]
  // }

  return null;
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

// //....................................... create lead from the FB Ads............................................
// async function createFB(newLead, userid) {
//   //delete newLead.id;
//   console.log("===model area==")
//   try {
//     const { legacyid, pageid, formid, adid, status, FULL_NAME, EMAIL, PHONE } =
//       newLead

//     var firstName = FULL_NAME.split(" ").slice(0, -1).join(" ")
//     var lastName = FULL_NAME.split(" ").slice(-1).join(" ")

//     const result = await sql.query(
//       `INSERT INTO ${this.schema}.lead (firstname, lastname, email, phone, pageid, formid, adid, status, legacyid, leadsource, ownerid, createdbyid, lastmodifiedbyid)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
//       [
//         firstName,
//         lastName,
//         EMAIL,
//         PHONE,
//         pageid,
//         formid,
//         adid,
//         status,
//         legacyid,
//         "Facebook",
//         userid,
//         userid,
//         userid,
//       ]
//     )
//     if (result.rows.length > 0) {
//       return { id: result.rows[0].id, ...newLead }
//     }
//   } catch (error) {
//     console.log("===model==" + JSON.stringify(error))
//   }

//   return null
// }
//.....................................find lead by id........................................
async function findById(id) {
  console.log("id *==>", id);
  let filter = ` lead.id = '${id}'`;
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

//.....................................find lead by ownerId....................................
async function findByOwnerId(id) {
  //console.log("id ", id);
  //const result = await sql.query(`SELECT * FROM lead WHERE ownerid = $1`,[id]);
  let query = `SELECT ${this.schema}.lead.*,  concat(cu.firstname, ' ' , cu.lastname) createdbyname, concat(mu.firstname, ' ' , mu.lastname) lastmodifiedbyname, concat(owner.firstname, ' ' , owner.lastname) ownername  FROM ${this.schema}.lead `;
  query += ` INNER JOIN public.user cu ON cu.Id = ${this.schema}.lead.createdbyid `;
  query += ` INNER JOIN public.user mu ON mu.Id = ${this.schema}.lead.lastmodifiedbyid `;
  query += ` LEFT JOIN public.user owner ON owner.Id = ${this.schema}.lead.ownerid `;

  const result = await sql.query(query + " WHERE lead.ownerid = $1", [id]);
  if (result.rows.length > 0) return result.rows;

  return null;
}

//.......................................find all lead................................
async function findAll(title) {
  let itemQuery;
  if (title) {
    itemQuery = selectByIdQuery(
      this.schema,
      `lead.title LIKE '%${title}%'`,
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

//..............................................Update Lead................................
async function updateById(
  id,
  newLead,
  newAreaDetails,
  newHeightDetails,
  newPricingDetails,
  userid
) {
  console.log("newAreaDetails *==>", newAreaDetails);
  console.log("newHeightDetails *==>", newHeightDetails);
  console.log("newPricingDetails *==>", newPricingDetails);

  delete newLead.id;
  newLead["lastmodifiedbyid"] = userid;
  const query = buildUpdateQuery(id, newLead, this.schema);
  // Turn req.body into an array of values
  var colValues = Object.keys(newLead).map(function (key) {
    return newLead[key];
  });

  console.log("query:", query, newAreaDetails);

  let tempPropDetailsResult = [];
  console.log("q -", query);
  console.log("colValues", colValues);
  const result = await sql.query(query, colValues);
  console.log("result *==>", result);

  if (result.rowCount > 0) {
    console.log("rows *==>", result.rows);
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
    // const detailsArray = [...newAreaDetails, ...newHeightDetails];
    // console.log("detailsArray *==>", detailsArray);

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
          propertyDetailsQuery,
          colval
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
      console.log("details pricing*==>", details);
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
      ...newLead,
      areadetails,
      heightdetails,
      pricingOrRentalDetails,
    };
    console.log("response *==>", response);
    return response;
  }
  return null;
}

//.....................................................Delete lead...........................
async function deleteLead(id) {
  const result = await sql.query(
    `DELETE FROM ${this.schema}.lead WHERE id = $1`,
    [id]
  );

  if (result.rowCount > 0) return "Success";
  return null;
}

function buildUpdateQuery(id, cols, schema, tableName) {
  // Setup static beginning of query\
  delete cols.id;
  var query = [`UPDATE ${schema}.${tableName || "lead"} `];
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

function prepareMailForNewLead(newLead) {
  let email = {
    to: newLead.owneremail,
    subject: "New Lead Assigned to you",
    body: ` Hi ${newLead.ownername} <br/><br/>
            A new lead <a href="${constants.DEPLOYED_HOST}/leads/${newLead.id}" target="_blank">${newLead.firstname} ${newLead.lastname}</a> is created for you. <br/>
            Please contact asap <br/><br/>
            Thanks<br/>
            Admin
            Name: ${newLead.createdbyname}
            Company: Sthapatya Leasing`,
  };
  return email;
}

// //....................................... Interested Property Create Lead .........................................
// async function interestedPropertyCreateLead(newLead) {
//   console.log("newLead ", this.schema, newLead)
//   delete newLead.id

//   const result = await sql.query(
//     `INSERT INTO ${this.schema}.lead (firstname, lastname, email, phone, propertyid, ownerid, createdbyid , lastmodifiedbyid, leadsource, status)  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
//     [
//       newLead.firstname,
//       newLead.lastname,
//       newLead.email,
//       newLead.phone,
//       newLead.propertyid,
//       "90a036a5-2b40-4adc-bd27-e6ec5011a96f",
//       "90a036a5-2b40-4adc-bd27-e6ec5011a96f",
//       "90a036a5-2b40-4adc-bd27-e6ec5011a96f",
//       "Web",
//       "Open - Not Contacted",
//     ]
//   )
//   if (result.rows.length > 0) {
//     return { id: result.rows[0].id, ...newLead }
//   }

//   return null
// }

module.exports = {
  init,
  findById,
  updateById,
  findAll,
  create,
  deleteLead,
  findByOwnerId,
  // createFB,
  prepareMailForNewLead,
  // interestedPropertyCreateLead,
};
