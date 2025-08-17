/**
 * Handles all incoming request for /api/pricingorrental endpoint
 * DB table for this public.property
 * Model used here is property.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/pricingorrental
 *              GET     /api/pricingorrental/:id
 *              POST    /api/pricingorrental
 *              PUT     /api/pricingorrental/:id
 *              DELETE  /api/pricingorrental/:id
 *
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const PricingOrRental = require("../models/pricingorrental.model.js");
const permissions = require("../constants/permissions.js");
const global = require("../constants/global.js");

module.exports = (app) => {
  const { body, validationResult } = require("express-validator");

  var router = require("express").Router();


  //Get PricingOrRental or LeadDetails by Parent Id
  router.get("/:id/", fetchUser, async (req, res) => {
    try {
      console.log("fetchUser *==>",fetchUser);
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

      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
      PricingOrRental.init(req.userinfo.tenantcode);
      let resultPricingOrRental = await PricingOrRental.findPricingOrRentalByParentId(req.params.id);
      if (resultPricingOrRental) {
        return res.status(200).json(resultPricingOrRental);
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
    console.log('idsToDelete *==>',idsToDelete);

    PricingOrRental.init(req.userinfo.tenantcode);

    const results = await PricingOrRental.deletePricingOrRental(idsToDelete);
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

  app.use(process.env.BASE_API_URL + "/api/pricingorrental", router);
};
