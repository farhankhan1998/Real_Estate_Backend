/**
 * Handles all incoming request for /api/transactions endpoint
 * DB table for this public.property
 * Model used here is property.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/transactions
 *              GET     /api/transactions/:id
 *              POST    /api/transactions
 *              PUT     /api/transactions/:id
 *              DELETE  /api/transactions/:id
 * 
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Transaction = require("../models/transaction.model.js");
const permissions = require("../constants/permissions.js");
const global = require("../constants/global.js");

module.exports = app => {
  

  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();

  // ..........................................Create property..........................................
  router.post("/", fetchUser, [
    body('amount', 'Please enter name').isLength({ min: 1 }),
    body('type', 'Please enter type').isLength({ min: 1 })
  ] ,

  async (req, res)=>{
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD 
                                                                    || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors : errors.array()});
    }
    Transaction.init(req.userinfo.tenantcode);
    const propertyRec = await Transaction.create(req.body, req.userinfo.id);

    console.log('propertyRec:', propertyRec);
    if(!propertyRec){
      return res.status(400).json({errors : "Bad Request"});
    }

    return res.status(201).json({success: true, propertyRec});

  });





   // ..........................................Create property from facebook..........................................
  router.post("/fb", [ ] ,
    async (req, res)=>{
      if(!req.body)
        res.status(400).json({errors : "Bad Request"});
     
        try {
          Transaction.init(req.userinfo.tenantcode);
          const propertyRec = await Transaction.createFB(req.body, global.SYSTEM_DEFAULT_USER);

          console.log('propertyRec:', propertyRec);
          if(!propertyRec){
            return res.status(400).json({errors : "Bad Request"});
          }

        return res.status(201).json(propertyRec);
        } catch (error) {
          console.log("===", JSON.stringify(error));
          return res.status(400).json({errors : error});
        }
       

    });



  // ......................................Get All property........................................
  router.get("/", fetchUser, async (req, res)=>{
    //Check permissions 
    console.log('permissions.VIEW_LEAD:', permissions.VIEW_LEAD);
    const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                        || el.name === permissions.MODIFY_ALL
                                                        || el.name === permissions.VIEW_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});
    Transaction.init(req.userinfo.tenantcode);
    const transactions = await Transaction.findAll();
    //console.log('transactions:', transactions);
    if(transactions){
      res.status(200).json(transactions);
    }else{
      res.status(400).json({errors : "No data"});
    }

  });


  // .....................................Get Transaction by Id........................................
  router.get("/:id", fetchUser, async (req, res)=>{
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                          || el.name === permissions.MODIFY_ALL
                                                          || el.name === permissions.VIEW_ALL);
      if (!permission) return res.status(401).json({errors : "Unauthorized"});
      Transaction.init(req.userinfo.tenantcode);
      let resultTransaction = await Transaction.findById(req.params.id);
      if(resultTransaction){
        return res.status(200).json(resultTransaction);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      console.log('System Error:', error);
      return res.status(400).json({"success" : false, "message"  : error});
    }
  });


  //......................................Get Transaction by OwnerId.................................
   router.get("/:id/*", fetchUser, async (req, res)=>{
    try {
      console.log('--------');
      //Check permissions
      const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                          || el.name === permissions.MODIFY_ALL
                                                          || el.name === permissions.VIEW_ALL);
      if (!permission) return res.status(401).json({errors : "Unauthorized"});
      Transaction.init(req.userinfo.tenantcode);
      let resultTransaction = await Transaction.findByOwnerId(req.params.id);
      if(resultTransaction){
        return res.status(200).json(resultTransaction);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      console.log('System Error:', error);
      return res.status(400).json({"success" : false, "message"  : error});
    }
  });



  //.........................................Update property .....................................
  router.put("/:id", fetchUser,  async (req, res)=>{
    try {
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});

    const {title, status, type, paymentstatus, category, amount, description, parentid, transactiondate, pincode, country, targetdate, company, ownerid} = req.body;
    const errors = [];
    const propertyRec = {};

    //console.log("fnm", req.body.hasOwnProperty("salutation"));
    if(req.body.hasOwnProperty("type")){propertyRec.type = type};
    if(req.body.hasOwnProperty("title")){propertyRec.title = title};
    if(req.body.hasOwnProperty("status")){propertyRec.status = status};
    if(req.body.hasOwnProperty("paymentstatus")){propertyRec.paymentstatus = paymentstatus};
    if(req.body.hasOwnProperty("category")){propertyRec.category = category};
    if(req.body.hasOwnProperty("amount")){propertyRec.amount = amount};
    if(req.body.hasOwnProperty("description")){propertyRec.description = description};
    if(req.body.hasOwnProperty("parentid")){propertyRec.parentid = parentid};
    if(req.body.hasOwnProperty("transactiondate")){propertyRec.transactiondate = transactiondate};
    
    

    if(errors.length !== 0){
      return res.status(400).json({errors : errors});
    }
    Transaction.init(req.userinfo.tenantcode);
    let resultTransaction = await Transaction.findById(req.params.id);

    //console.log("res", resultTransaction);
    
    if(resultTransaction){
      //console.log('req.userinfo:', req.userinfo);
      resultTransaction = await Transaction.updateById(req.params.id, propertyRec, req.userinfo.id);
      if(resultTransaction){
        return res.status(200).json({"success" : true, "message" : "Record updated successfully"});
      }
      return res.status(200).json(resultTransaction);


    }else{
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    }
    
    
    } catch (error) {
      console.log('error:', error);
      res.status(400).json({errors : error});
    }
    
  });




  // .................................................Delete Transaction............................
  router.delete("/:id", fetchUser, async (req, res) => {
    //Check permissions
    const permission = req.userinfo.permissions.find(el => el.name === permissions.DELETE_LEAD
                                                        || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});
    Transaction.init(req.userinfo.tenantcode);
    const result = await Transaction.deleteTransaction(req.params.id);
    if(!result)
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    
      res.status(400).json({"success" : true, "message"  : "Successfully Deleted"});
  });

  // Delete all Tutorials
  //router.delete("/", transactions.deleteAll);

  app.use(process.env.BASE_API_URL + '/api/transactions', router);
};
