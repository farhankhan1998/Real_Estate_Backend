const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Report = require("../models/report.model.js");
const permissions = require("../constants/permissions.js");

module.exports = app => {
  

  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();

  // ..............................Create Report..........................................
  router.post("/", fetchUser, [
    body('name', 'Please enter report name').isLength({ min: 1 }),
    body('query', 'Please enter query')
  ] ,
  
   async (req, res)=>{
    /* //Check permissions
         const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD 
        || el.name === permissions.MODIFY_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});


    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors : errors.array()});
    } */
    Report.init(req.userinfo.tenantcode);
    const objRec = await Report.create(req.body, req.userinfo.id);

    console.log('objRec:', objRec);
    if(!objRec){
      return res.status(400).json({errors : "Bad Request"});
    }

    return res.status(201).json(objRec);

  });

  // ..............................Get All Report........................................
  router.get("/", fetchUser, async (req, res)=>{

    /* //Check permissions
        const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                            || el.name === permissions.MODIFY_ALL
                                                            || el.name === permissions.VIEW_ALL);
        if (!permission) return res.status(401).json({errors : "Unauthorized"}); */
    
    Report.init(req.userinfo.tenantcode);
    const allRecords = await Report.findAll();
    console.log('allRecords:', allRecords);
    if(allRecords){
      res.status(200).json(allRecords);
    }else{
      res.status(400).json({errors : "No data"});
    }

  });

  // .....................................Get Report by Id........................................
  router.get("/:id", fetchUser, async (req, res)=>{
    try {
        
        /* //Check permissions
        const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                            || el.name === permissions.MODIFY_ALL
                                                            || el.name === permissions.VIEW_ALL);
        if (!permission) return res.status(401).json({errors : "Unauthorized"}); */


      console.log('req.id:', req.id);
      Report.init(req.userinfo.tenantcode);
      let resultObj = await Report.findById(req.params.id);
      if(resultObj){
        return res.status(200).json(resultObj);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      return res.status(400).json({"success" : false, "message"  : error});
    }

  });

  //.........................................Update Report .....................................
  router.put("/:id", fetchUser,  async (req, res)=>{
    try {

        /* //Check permissions
        const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD || el.name === permissions.MODIFY_ALL);
        if (!permission) return res.status(401).json({errors : "Unauthorized"}); */
    
    
        const {name,query} = req.body;
        const errors = [];
        const objRec = {};
    
        if(req.body.hasOwnProperty("name")){objRec.name = name; if(!name){errors.push('Name is required')}};
        if(req.body.hasOwnProperty("query")){objRec.query = query; if(!query){errors.push('Query is required')}};
    
        if(errors.length !== 0){
          return res.status(400).json({errors : errors});
        }
        Report.init(req.userinfo.tenantcode);
        let resultObj = await Report.findById(req.params.id);
    
        console.log("res", resultObj);
        
        if(resultObj){
          console.log('resultCon1:', resultObj);
          resultObj = await Report.updateById(req.params.id, objRec,req.userinfo.id);
          if(resultObj){
            return res.status(200).json({"success" : true, "message" : "Record updated successfully"});
          }
          return res.status(200).json(resultObj);
    
    
        }else{
          return res.status(200).json({"success" : false, "message"  : "No record found"});
        }
        
    
    } catch (error) {
        res.status(400).json({errors : error});
    }

  });

  // ...............................................Delete report......................................
  router.delete("/:id", fetchUser, async (req, res) => {
    Report.init(req.userinfo.tenantcode);
    const result = await Report.deleteReport(req.params.id);
    if(!result)
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    
      res.status(400).json({"success" : true, "message"  : "Successfully Deleted"});
  });

  router.get("/byname/:name/:fromdate?/:todate?", fetchUser, async (req, res)=>{
    try {
        console.log('name *==>',req.params.name)
        console.log('fromdate *==>',req.params.fromdate)
        console.log('todate *==>',req.params.todate)
        /* //Check permissions
        const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                            || el.name === permissions.MODIFY_ALL
                                                            || el.name === permissions.VIEW_ALL);
        if (!permission) return res.status(401).json({errors : "Unauthorized"}); */

        const fromdate = req.params.fromdate || null;
        const todate = req.params.todate || null;

        Report.init(req.userinfo.tenantcode);
      let resultObj = await Report.findByName(req.params.name,fromdate,todate);
      if(resultObj){
        return res.status(200).json(resultObj);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      return res.status(400).json({"success" : false, "message"  : error});
    }

  });
  app.use(process.env.BASE_API_URL + '/api/reports', router);
};
