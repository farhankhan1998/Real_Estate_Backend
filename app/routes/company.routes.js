/**
 * Handles all incoming request for /api/company endpoint
 * DB table for this public.company
 * Model used here is company.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/company
 *              GET     /api/company/:id
 *              POST    /api/company
 *              PUT     /api/company/:id
 *              DELETE  /api/company/:id
 * 
 * @author      Rahul Joshi
 * @date        Feb, 2023
 * @copyright   Farhan Khan  
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Company = require("../models/company.model.js");

module.exports = app => {

  var router = require("express").Router();

  router.get("/from-emails", fetchUser, async(req, res) => {
    try{
      let emailResult = Company.getFromEmailAddress();
      return res.status(emailResult.statusCode).json(emailResult)
    }catch(error){
      return res.status(500).json({ errors: error.message });
    }
  })

  //Company Find By Id
  router.get("/:id",async(req,res) => {
    const companyResult =  await Company.findById(req.params.id);
    if(!companyResult){
        return res.status(400).json({errors : "Not Exist..!!"});
    }
    return res.status(200).json(companyResult);
  })

  app.use(process.env.BASE_API_URL + '/api/company', router);
};
