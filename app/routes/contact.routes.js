/**
 * Handles all incoming request for /api/contacts endpoint
 * DB table for this public.contact
 * Model used here is contact.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/contacts
 *              GET     /api/contacts/:id
 *              POST    /api/contacts
 *              PUT     /api/contacts/:id
 *              DELETE  /api/contacts/:id
 * 
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan  
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Contact = require("../models/contact.model.js");
const permissions = require("../constants/permissions.js");

module.exports = app => {
  

  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();

  // ................................ Create a new Contact ................................
  router.post("/", fetchUser, [
    body('firstname', 'Please enter firstname').isLength({ min: 1 }),
    body('lastname', 'Please enter lastname').isLength({ min: 1 }),
    body('phone', 'Please enter valid phone (10 digit)').isLength({ min: 10 })
  ] ,

  async (req, res)=>{
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD 
      || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});
    console.log('-------------');
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors : errors.array()});
    }
    Contact.init(req.userinfo.tenantcode);
    const contactRec = await Contact.create(req.body,  req.userinfo.id);

    console.log('-------------');
    if(!contactRec){
      return res.status(400).json({errors : "Bad Request"});
    }

    return res.status(201).json(contactRec);

  });

  // .....................................Get All Contacts........................................
  router.get("/", fetchUser, async (req, res)=>{
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                        || el.name === permissions.MODIFY_ALL
                                                        || el.name === permissions.VIEW_ALL);

    if (!permission) return res.status(401).json({errors : "Unauthorized"});

    Contact.init(req.userinfo.tenantcode);
    const contacts = await Contact.findAll();
    console.log('contacts:', contacts);
    if(contacts){
      res.status(200).json(contacts);
    }else{
      res.status(400).json({errors : "No data"});
    }

  });

  //......................................Get Contact by OwnerId.................................
  router.get("/:id", fetchUser, async (req, res)=>{
    try {
   //Check permissions
   const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                      || el.name === permissions.MODIFY_ALL
                                                      || el.name === permissions.VIEW_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});

    
      console.log('req.id:', req.id);
      Contact.init(req.userinfo.tenantcode);
      let resultCon = await Contact.findById(req.params.id);
      if(resultCon){
        return res.status(200).json(resultCon);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      console.log('System Error:', error);
      return res.status(400).json({"success" : false, "message"  : error});
    }
  });

  //......................................Update Contact.................................
  router.put("/:id", fetchUser,  async (req, res)=>{
    try {
    //Check permissions
    console.log('=========Routes Contact=============');
    const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});

    const {salutation, firstname, lastname, title, email, phone, street, city, state, pincode, country, company, type,contactcreateddate} = req.body;
    const errors = [];
    const contactRec = {};

    console.log("fnm", req.body.hasOwnProperty("salutation"));
    if(req.body.hasOwnProperty("salutation")){contactRec.salutation = salutation};
    if(req.body.hasOwnProperty("firstname")){contactRec.firstname = firstname; if(!firstname){errors.push('Firstname is required')}};
    if(req.body.hasOwnProperty("lastname")){contactRec.lastname = lastname; if(!lastname){errors.push('Lastname is required')}};
    if(req.body.hasOwnProperty("title")){contactRec.title = title};
    if(req.body.hasOwnProperty("email")){contactRec.email = email};
    if(req.body.hasOwnProperty("phone")){contactRec.phone = phone;if(!phone){phone; errors.push('Phone is required')}};
    if(req.body.hasOwnProperty("street")){contactRec.street = street};
    if(req.body.hasOwnProperty("city")){contactRec.city = city};
    if(req.body.hasOwnProperty("state")){contactRec.state = state};
    if(req.body.hasOwnProperty("pincode")){contactRec.pincode = pincode};
    if(req.body.hasOwnProperty("country")){contactRec.country = country};
    if(req.body.hasOwnProperty("company")){contactRec.company = company};
    if(req.body.hasOwnProperty("type")){contactRec.type = type};
    if(req.body.hasOwnProperty("contactcreateddate")){contactRec.contactcreateddate = contactcreateddate};

    console.log('==================================');
    if(errors.length !== 0){
      return res.status(400).json({errors : errors});
    }
    Contact.init(req.userinfo.tenantcode);
    let resultCon = await Contact.findById(req.params.id);

    console.log("res", resultCon);
    
    if(resultCon){
      console.log('resultCon1:', resultCon);
      resultCon = await Contact.updateById(req.params.id, contactRec, req.userinfo.id);
      if(resultCon){
        return res.status(200).json({"success" : true, "message" : "Record updated successfully"});
      }
      return res.status(200).json(resultCon);


    }else{
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    }
    
    
    } catch (error) {
      res.status(400).json({errors : error});
    }
    
  });

  // Delete a Tutorial with id
  router.delete("/:id", fetchUser, async (req, res) => {
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.DELETE_CONTACT || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});

    Contact.init(req.userinfo.tenantcode);
    const result = await Contact.deleteContact(req.params.id);
    console.log('result *=>',result)
    if(!result)
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    
      res.status(200).json({"success" : true, "message"  : "Successfully Deleted"});
  });

  // Delete all Tutorials
  //router.delete("/", contacts.deleteAll);

  app.use(process.env.BASE_API_URL + '/api/contacts', router);
};
