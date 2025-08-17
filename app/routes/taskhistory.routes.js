const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const taskhistory = require("../models/taskhistory.model.js");
// const permissions = require("../constants/permissions.js");
// const Mailer = require("../models/mail.model.js");
// const Auth = require("../models/auth.model.js");

module.exports = app => {
  

  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();

//   router.get("/", async (req, res)=>{
//     console.log('get api called');
//   })
  router.post("/", fetchUser,  async (req, res)=>{
    console.log('req.body', req.body)
    const errors = validationResult(req);
    console.log('errors  :-  ',errors);
    if(!errors.isEmpty()){
      return res.status(400).json({errors : errors.array()});
    }
    taskhistory.init(req.userinfo.tenantcode);
    const taskhistoryRec = await taskhistory.create(req.body, req.userinfo.id);

    console.log('taskhistoryRec:', taskhistoryRec);
    if(!taskhistoryRec){
      return res.status(400).json({errors : "Bad Request"});
    }

    return res.status(201).json(taskhistoryRec);

  });

  router.get("/:id", fetchUser, async (req, res)=>{
    try {
      //Check permissions
    //   const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
    //     || el.name === permissions.MODIFY_ALL
    //     || el.name === permissions.VIEW_ALL);
    //   if (!permission) return res.status(401).json({errors : "Unauthorized"});
    console.log('req.params.id===' , req.params.id)
      taskhistory.init(req.userinfo.tenantcode);  
      let resultTask = await taskhistory.findTaskHistory(req.params.id);
      console.log('resultTask' , resultTask);
      if(resultTask){
        return res.status(200).json(resultTask);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      console.log('System Error:', error);
      return res.status(400).json({"success" : false, "message"  : error});
    }
  });


  app.use(process.env.BASE_API_URL + '/api/taskhistory', router);

};