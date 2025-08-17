/**
 * Handles all incoming request for /api/enquires endpoint
 * DB table for this public.enquiry
 * Model used here is enquiry.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/enquires
 *              GET     /api/enquires/:id
 *              POST    /api/enquires
 *              PUT     /api/enquires/:id
 *              DELETE  /api/enquires/:id
 * 
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Enquiry = require("../models/enquiry.model.js");
const permissions = require("../constants/permissions.js");
const leadModel = require("../models/lead.model.js");
const global = require("../constants/global.js");

module.exports = app => {
  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();

  // ..........................................Create enquiry..........................................
  router.post("/", [
    body('firstname', 'Please enter name').isLength({ min: 1 }),
    body('tenantcode', 'Please enter tenantcode').isLength({ min: 1 }),
    body('userid', 'Please enter userid').isUUID()
  ] ,
  async (req, res)=>{
    //Check permissions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    Enquiry.init(req.body.tenantcode);
    const enquiryRec = await Enquiry.create(req.body, req.body.userid);

    console.log('enquiryRec:', enquiryRec);
    if(!enquiryRec){
      return res.status(400).json({errors : "Bad Request"});
    }
    return res.status(201).json({success: true, message: "Record inserted successfully"});
  });


    // ..............................Create Lead  ........................................

    router.post("/convert-lead/:enquiryid", fetchUser, async (req, res) => {
        try {
          const permission = req.userinfo.permissions.find(el =>
            el.name === permissions.VIEW_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL
          );
          if (!permission)
            return res.status(401).json({ errors: "Unauthorized" });
      
            Enquiry.init(req.userinfo.tenantcode);
          const enquiryId = req.params.enquiryid;
          console.log('enquiryId *==>',enquiryId)
      
          const enquiryRecord = await Enquiry.findById(enquiryId);
          console.log('enquiryRecord *==>',enquiryRecord)
    
      
          if (!enquiryRecord) {
            console.log('inside if *===>')
            return res.status(404).json({ errors: "enquiry not found" });
          }
      
        // leadModel.init(req.userinfo.tenantcode);
        //   const createdLead= await leadModel.create(enquiryRecord, req.userinfo.id);
        //   console.log('createdLead*==>',createdLead)
        //   return res.status(200).json({
        //     message: "Lead created",
        //     data: createdLead
        //   });

          const createdLead= await Enquiry.createLead(enquiryRecord, req.userinfo.id);
          console.log('createdLead*==>',createdLead)
          return res.status(200).json({
            message: "Lead created",
            data: createdLead
          });
          
        } catch (error) {
          console.error(error);
          return res.status(500).json({ errors: "Internal Server Error" });
        }
      });

  // ......................................Get All enquiry........................................
  router.get("/", fetchUser, async (req, res)=>{
    //Check permissions 
    console.log('permissions.VIEW_LEAD:', permissions.VIEW_LEAD);
    const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                        || el.name === permissions.MODIFY_ALL
                                                        || el.name === permissions.VIEW_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});
    Enquiry.init(req.userinfo.tenantcode);
    const enquires = await Enquiry.findAll();
    if(enquires){
      res.status(200).json(enquires);
    }else{
      res.status(400).json({errors : "No data"});
    }

  });


  // .....................................Get Enquiry by Id........................................
  router.get("/:id", fetchUser, async (req, res)=>{
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                          || el.name === permissions.MODIFY_ALL
                                                          || el.name === permissions.VIEW_ALL);
      if (!permission) return res.status(401).json({errors : "Unauthorized"});
      Enquiry.init(req.userinfo.tenantcode);
      let resultEnquiry = await Enquiry.findById(req.params.id);
      if(resultEnquiry){
        return res.status(200).json(resultEnquiry);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      console.log('System Error:', error);
      return res.status(400).json({"success" : false, "message"  : error});
    }
  });

  //.........................................Update enquiry .....................................
  router.put("/:id", fetchUser,  async (req, res)=>{
    try {
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});

    const { firstname,lastname, phone, email, description, transactiontype, verticals} = req.body;
    const errors = [];
    const enquiryRec = {};
   
    if(req.body.hasOwnProperty("firstname")){enquiryRec.firstname = firstname};
    if(req.body.hasOwnProperty("lastname")){enquiryRec.lastname = lastname};  
    if(req.body.hasOwnProperty("phone")){enquiryRec.phone = phone};
    if(req.body.hasOwnProperty("email")){enquiryRec.email = email};
    if(req.body.hasOwnProperty("description")){enquiryRec.description = description};
    if(req.body.hasOwnProperty("transactiontype")){enquiryRec.transactiontype = transactiontype};
    if(req.body.hasOwnProperty("verticals")){enquiryRec.verticals = verticals};

    if(errors.length !== 0){
      return res.status(400).json({errors : errors});
    }
    Enquiry.init(req.userinfo.tenantcode);
    let resultEnquiry = await Enquiry.findById(req.params.id);
    
    if(resultEnquiry){
      resultEnquiry = await Enquiry.updateById(req.params.id, enquiryRec, req.userinfo.id);
      if(resultEnquiry){
        return res.status(200).json({"success" : true, "message" : "Record updated successfully"});
      }
      return res.status(200).json(resultEnquiry);
    }else{
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    }
    } catch (error) {
      console.log('error:', error);
      res.status(400).json({errors : error});
    }
  });



  // .................................................Delete Enquiry............................
  router.delete("/:id", fetchUser, async (req, res) => {
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.DELETE_LEAD
                                                        || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});
    Enquiry.init(req.userinfo.tenantcode);
    const result = await Enquiry.deleteEnquiry(req.params.id);
    if(!result)
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    
      res.status(400).json({"success" : true, "message"  : "Successfully Deleted"});
  });

  app.use(process.env.BASE_API_URL + '/api/enquiries', router);
};
