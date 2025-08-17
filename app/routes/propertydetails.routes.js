/**
 * Handles all incoming request for /api/propertydetails endpoint
 * DB table for this public.property
 * Model used here is property.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/propertydetails
 *              GET     /api/propertydetails/:id
 *              POST    /api/propertydetails
 *              PUT     /api/propertydetails/:id
 *              DELETE  /api/propertydetails/:id
 *
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const PropertyDetails = require("../models/propertydetails.model.js");
const permissions = require("../constants/permissions.js");
const global = require("../constants/global.js");

module.exports = (app) => {
  const { body, validationResult } = require("express-validator");

  var router = require("express").Router();


  //Get PropertyDetails or LeadDetails by Parent Id
  router.get("/:id/", fetchUser, async (req, res) => {
    try {
      console.log("fetchUser *==>",fetchUser);
      console.log("req.params.id *==>",req.params.id);
      console.log("req.userinfo *==>",req.userinfo);
      console.log("req.userinfo.permissions *==>",req.userinfo.permissions);

      //Check permissions
      // const permission = req.userinfo.permissions.find(
      //   (el) =>
      //     // el.name === permissions.VIEW_CONTACT ||
      //     el.name === permissions.MODIFY_ALL || el.name === permissions.VIEW_ALL
      // );
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.VIEW_LEAD ||
          el.name === permissions.MODIFY_ALL ||
          el.name === permissions.VIEW_ALL
      );
      console.log("permission *==>",permission);

      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
      PropertyDetails.init(req.userinfo.tenantcode);
      let resultPropertyDetails = await PropertyDetails.findPropertyDetailsByParentId(req.params.id);
      if (resultPropertyDetails) {
        return res.status(200).json(resultPropertyDetails);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.log("error", error);
      return res.status(400).json({ success: false, message: error });
    }
  });

  router.delete("/", fetchUser, async (req, res) => {
    // Check permissions
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.DELETE_LEAD ||
        el.name === permissions.MODIFY_ALL
    );
    if (!permission) return res.status(401).json({ errors: "Unauthorized" });

    const idsToDelete = req.body;

    PropertyDetails.init(req.userinfo.tenantcode);

    const results = await PropertyDetails.deletePropertyDetails(idsToDelete);
    console.log("results *==>", results);

    if (results && results.length > 0) {
      res.status(200).json({ success: true, message: "Successfully Deleted" });
    } else {
      res
        .status(404)
        .json({
          success: false,
          message: "No records found for the given IDs",
        });
    }
  });

  app.use(process.env.BASE_API_URL + "/api/propertydetails", router);
};
