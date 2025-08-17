/**
 * Handles all incoming request for /api/projects endpoint
 * Model used here is dashboard.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/dashboard/totalproject
 *
 * @author      Rahul Joshi
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Dashboard = require("../models/dashboard.model.js");
const permissions = require("../constants/permissions.js");
const global = require("../constants/global.js");

module.exports = (app) => {
  const { body, validationResult } = require("express-validator");

  var router = require("express").Router();

  router.get("/totalproject/", fetchUser, async (req, res) => {
    //Check permissions
    console.log("yes");
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.VIEW_PRODUCT ||
        el.name === permissions.MODIFY_ALL ||
        el.name === permissions.VIEW_ALL
    );

    if (!permission) return res.status(401).json({ errors: "Unauthorized" });

    Dashboard.init(req.userinfo.tenantcode);
    const data = await Dashboard.getTotalProperties();
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ errors: "No data" });
    }
  });

  router.get("/totalcontacts/", fetchUser, async (req, res) => {
    //Check permissions
    console.log("yes");
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.VIEW_PRODUCT ||
        el.name === permissions.MODIFY_ALL ||
        el.name === permissions.VIEW_ALL
    );

    if (!permission) return res.status(401).json({ errors: "Unauthorized" });

    Dashboard.init(req.userinfo.tenantcode);
    const data = await Dashboard.getTotalContacts();
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ errors: "No data" });
    }
  });

  router.get("/totalleads/", fetchUser, async (req, res) => {
    //Check permissions
    console.log("yes");
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.VIEW_PRODUCT ||
        el.name === permissions.MODIFY_ALL ||
        el.name === permissions.VIEW_ALL
    );

    if (!permission) return res.status(401).json({ errors: "Unauthorized" });

    Dashboard.init(req.userinfo.tenantcode);
    const data = await Dashboard.getTotalLeads();
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ errors: "No data" });
    }
  });
  
  router.get("/totalincome/", fetchUser, async (req, res) => {
    //Check permissions
    console.log("yes");
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.VIEW_PRODUCT ||
        el.name === permissions.MODIFY_ALL ||
        el.name === permissions.VIEW_ALL
    );

    if (!permission) return res.status(401).json({ errors: "Unauthorized" });

    Dashboard.init(req.userinfo.tenantcode);
    const data = await Dashboard.getTotalIncome();
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ errors: "No data" });
    }
  });

  app.use(process.env.BASE_API_URL + "/api/dashboard", router);
};
