/**
 * Handles all incoming request for /api/oldleads endpoint
 * DB table for this public.lead
 * Model used here is OldLead.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/oldleads
 *              GET     /api/oldleads/:id
 *              POST    /api/oldleads
 *              PUT     /api/oldleads/:id
 *              DELETE  /api/oldleads/:id
 *
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const OldLead = require("../models/oldlead.model.js");
const permissions = require("../constants/permissions.js");

module.exports = (app) => {
  const { body, validationResult } = require("express-validator");

  var router = require("express").Router();

  // ..........................................Create OldLead..........................................

  router.post("/", fetchUser, async (req, res) => {
    // Check permissions
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.EDIT_LEAD || el.name === permissions.MODIFY_ALL
    );

    if (!permission) return res.status(401).json({ errors: "Unauthorized" });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const isValidCSV = validateInsertBody(req.body, true);

    if (isValidCSV) {
      OldLead.init(req.userinfo.tenantcode);
      const leadRec = await OldLead.createForCSV(req.body, req.userinfo.id);

      if (!leadRec) {
        return res.status(400).json({ errors: "Bad Request" });
      }

      return res.status(201).json(leadRec);
    } else {
      return res.status(400).json({ error: "Data is incorrect" });
    }
  });

  // ......................................Get All OldLead........................................
  router.get("/", fetchUser, async (req, res) => {
    //Check permissions
    console.log("permissions.VIEW_LEAD:", permissions.VIEW_LEAD);
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.VIEW_LEAD ||
        el.name === permissions.MODIFY_ALL ||
        el.name === permissions.VIEW_ALL
    );
    if (!permission) return res.status(401).json({ errors: "Unauthorized" });
    OldLead.init(req.userinfo.tenantcode);
    const leads = await OldLead.findAll();
    if (leads) {
      res.status(200).json(leads);
    } else {
      res.status(400).json({ errors: "No data" });
    }
  });

  // .....................................Get Lead by Id........................................
  router.get("/:id", fetchUser, async (req, res) => {
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.VIEW_LEAD ||
          el.name === permissions.MODIFY_ALL ||
          el.name === permissions.VIEW_ALL
      );
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
      OldLead.init(req.userinfo.tenantcode);
      let resultLead = await OldLead.findById(req.params.id);
      console.log("resultLead *==>", resultLead);

      if (resultLead) {
        return res.status(200).json(resultLead);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.log("System Error:", error);
      return res.status(400).json({ success: false, message: error });
    }
  });

  // .................................................Delete OldLead............................
  router.delete("/:id", fetchUser, async (req, res) => {
    //Check permissions
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.DELETE_LEAD ||
        el.name === permissions.MODIFY_ALL
    );
    if (!permission) return res.status(401).json({ errors: "Unauthorized" });
    OldLead.init(req.userinfo.tenantcode);
    const result = await OldLead.deleteLead(req.params.id);
    if (!result)
      return res
        .status(200)
        .json({ success: false, message: "No record found" });

    res.status(400).json({ success: true, message: "Successfully Deleted" });
  });

  app.use(process.env.BASE_API_URL + "/api/oldleads", router);
};

function validateInsertBody(body) {
  console.log("body *==>", body);
  let isValid;

  if (body) {
    if(body.constructor === Object){
      body = [body]
    }
    
    let result =  body.map(item => {
      return validateSingleRecordForCSV(item);
    });
    console.log('result:', result);
    isValid = result.every((each) => each === true);
    
  } else {
    isValid = false;
  }
  return isValid;
}

function validateSingleRecordForCSV(record) {
  console.log("record *==>", record);
  if (record && record.constructor === Object) {
    console.log("inside object");
    return Object.keys(record).length > 0;
  }
  return false;
}
