/**
 * Handles all incoming request for /api/tasks endpoint
 * DB table for this public.task
 * Model used here is task.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/tasks/:pid/*
 *              GET     /api/tasks/:id
 *              POST    /api/tasks/:pid
 *              PUT     /api/tasks/:id
 *              DELETE  /api/tasks/:id
 * 
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Task = require("../models/task.model.js");
const permissions = require("../constants/permissions.js");
const Mailer = require("../models/mail.model.js");
const Auth = require("../models/auth.model.js");

module.exports = app => {
  

  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();

  // ..........................................Create Task..........................................
 // Create a new Task
  router.post("/", fetchUser, [
    body('title', 'Please enter title').isLength({ min: 1 })
  ],

  async (req, res)=>{
    console.log('req.userinfo.id', req.userinfo.id)
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors : errors.array()});
    }
    Task.init(req.userinfo.tenantcode);
    const taskRec = await Task.create(req.body, req.userinfo.id);

    console.log('taskRec:', taskRec);
    if(!taskRec){
      return res.status(400).json({errors : "Bad Request"});
    }

    return res.status(201).json(taskRec);

  });

  
   // ......................................Get parenttype = 'lead'........................................
   router.get("/task-for-leads/", fetchUser, async (req, res)=>{
    //Check permissions 
    console.log('permissions.VIEW_LEAD:', permissions.VIEW_LEAD);
    const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                        || el.name === permissions.MODIFY_ALL
                                                        || el.name === permissions.VIEW_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});
   Task.init(req.userinfo.tenantcode);
   const tasks = await Task.findParentTypeLead();
   console.log('tasks:', tasks);
   if(tasks){
     res.status(200).json(tasks);
   }else{
     res.status(400).json({errors : "No data"});
   }

 });


   // ......................................Get All lead........................................
  router.get("/", fetchUser, async (req, res)=>{
     //Check permissions 
     console.log('permissions.VIEW_LEAD:', permissions.VIEW_LEAD);
     const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                         || el.name === permissions.MODIFY_ALL
                                                         || el.name === permissions.VIEW_ALL);
     if (!permission) return res.status(401).json({errors : "Unauthorized"});
    Task.init(req.userinfo.tenantcode);
    const tasks = await Task.findAll();
    console.log('tasks:', tasks);
    if(tasks){
      res.status(200).json(tasks);
    }else{
      res.status(400).json({errors : "No data"});
    }

  });
    // Retrieve all Task
    router.get("/opentasks", fetchUser, async (req, res)=>{
      Task.init(req.userinfo.tenantcode);
      const tasks = await Task.findAllOpen(req.userinfo);
      console.log('tasks:', tasks);
      if(tasks){
        res.status(200).json(tasks);
      }else{
        res.status(400).json({errors : "No data"});
      }
  
    });

    router.get("/meetings/:today", fetchUser, async (req, res)=>{
      Task.init(req.userinfo.tenantcode);
      const tasks = await Task.findAllMeetings(req.userinfo, req.params.today);
      console.log('tasks:', tasks);
      if(tasks){
        res.status(200).json(tasks);
      }else{
        res.status(400).json({errors : "No data"});
      }
  
    });
 // .....................................Get Task by Id........................................
  router.get("/:id", fetchUser, async (req, res)=>{
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
        || el.name === permissions.MODIFY_ALL
        || el.name === permissions.VIEW_ALL);
      if (!permission) return res.status(401).json({errors : "Unauthorized"});
      Task.init(req.userinfo.tenantcode);  
      let resultTask = await Task.findById(req.params.id);
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


  //......................................Get Task by OwnerId.................................
  router.get("/:pid/*", fetchUser, async (req, res)=>{
    try {
      //Check permissions
      
      const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                          || el.name === permissions.MODIFY_ALL
                                                          || el.name === permissions.VIEW_ALL);
      if (!permission) return res.status(401).json({errors : "Unauthorized"});
      Task.init(req.userinfo.tenantcode);
      let resultTask = await Task.findByParentId(req.params.pid);
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

  

  //.........................................Update Task .....................................
 // Update a Task with id
 router.put("/:id", fetchUser,  async (req, res)=>{
  try {
      const {title, priority, status, type, description, parentid, ownerid, createdbyid, lastmodifiedbyid, targetdate, createddate, lastmodifieddate, startdatetime, enddatetime} = req.body;
      const errors = [];
      const taskRec = {};;

  console.log("fnm", req.body.hasOwnProperty("salutation"));
  if(req.body.hasOwnProperty("title")){taskRec.title = title; if(!title){errors.push('Title is required')}};
  if(req.body.hasOwnProperty("description")){taskRec.description = description};
  if(req.body.hasOwnProperty("priority")){taskRec.priority = priority};
  if(req.body.hasOwnProperty("targetdate")){taskRec.targetdate = targetdate};
  if(req.body.hasOwnProperty("parentid")){taskRec.parentid = parentid};
  if(req.body.hasOwnProperty("ownerid")){taskRec.ownerid = ownerid};
  if(req.body.hasOwnProperty("status")){taskRec.status = status};
  if(req.body.hasOwnProperty("type")){taskRec.type = type};
  if(req.body.hasOwnProperty("createddate")){taskRec.createddate = createddate};
  if(req.body.hasOwnProperty("lastmodifieddate")){taskRec.lastmodifieddate = lastmodifieddate};
  if(req.body.hasOwnProperty("createdbyid")){taskRec.createdbyid = createdbyid};
  if(req.body.hasOwnProperty("lastmodifiedbyid")){taskRec.lastmodifiedbyid = lastmodifiedbyid};
  if(req.body.hasOwnProperty("startdatetime")){taskRec.startdatetime = startdatetime};
  if(req.body.hasOwnProperty("enddatetime")){taskRec.enddatetime = enddatetime};


  if(errors.length !== 0){
    return res.status(400).json({errors : errors});
  }
  
  Task.init(req.userinfo.tenantcode);
  let resultTask = await Task.findById(req.params.id);

  console.log("res", resultTask);
  
  if(resultTask){
    console.log('resultTask:', resultTask);
    resultTask = await Task.updateById(req.params.id, taskRec, req.userinfo.id);
    if(resultTask){
      return res.status(200).json({"success" : true, "message" : "Record updated successfully"});
    }
    return res.status(200).json(resultTask);


  }else{
    return res.status(200).json({"success" : false, "message"  : "No record found"});
  }
  
  
  } catch (error) {
    res.status(400).json({errors : error});
  }
  
});

  // Delete a Task with id
  router.delete("/:id", fetchUser, async (req, res) => {
    Task.init(req.userinfo.tenantcode);
    const result = await Task.deleteTask(req.params.id);
    if(!result)
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    
      res.status(400).json({"success" : true, "message"  : "Successfully Deleted"});
  });

  // Delete all Tutorials
  //router.delete("/", contacts.deleteAll);

  // Create a new Task
  router.post("/sendemail", fetchUser, [
    body('subject', 'Please enter subject').isLength({ min: 1 }),
    body('to', 'Please enter to address').isEmail(),
    body('from', 'Please enter from email address').isEmail(),
  ],

  async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors : errors.array()});
    }
    const userRec = await Auth.findById(req.userinfo.id);
    let fromAdd = `${userRec.firstname} ${userRec.lastname}<${userRec.email}>`;
    console.log('req.body *==>' , req.body);
    let task = {};
    task.title = req.body.subject;
    task.priority = 'Normal';
    task.status = 'Completed';
    task.type = 'Email';
    // task.description = 'From : '+ req.body.from +'\nTo : '+ req.body.to;
    task.description = 'From: ' + req.body.from + '<br>To: ' + req.body.to;
    task.parentid = req.body.parentid,
    task.ownerid = req.userinfo.id;
    task.toemail = req.body.to;
    // task.fromemail = fromAdd;
    task.fromemail = req.body.from;
    task.ccemail = req.body.cc;
    task.targetdate = new Date();
    
    Task.init(req.userinfo.tenantcode);
    const taskRec = await Task.create(task, req.userinfo.id);


    
    console.log('taskRec:', taskRec);
    
    if(!taskRec){
      return res.status(400).json({errors : "Bad Request"});
    }else{

   
    res.status(201).json(taskRec);

    if(req.body.to){
      const userRec = await Auth.findById(req.userinfo.id);
      Mailer.init(req.userinfo.tenantcode);
      // let fromAdd = `${userRec.firstname} ${userRec.lastname}<${userRec.email}>`;
      Mailer.sendEmailWithAttachment(req.body.from, req.body.to,req.body.cc, req.body.subject, req.body.editorHtml, req.body.attachment);
    }
    
  }
  });

  app.use(process.env.BASE_API_URL + '/api/tasks', router);
};