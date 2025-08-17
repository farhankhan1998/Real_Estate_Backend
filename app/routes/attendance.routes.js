const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Attendance = require("../models/attendance.model.js");
const permissions = require("../constants/permissions.js");
const Notification = require('../models/notification.model.js')


module.exports = app => {
  

  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();

  // ..........................................Create Attendance..........................................
  router.post("/", fetchUser, [] , async (req, res)=>{
    const attendanceRec = await Attendance.createAttendance(req.body, req.userinfo.id);
    console.log('attendanceRec *==>',attendanceRec);
    if(!attendanceRec){
      return res.status(400).json({errors : "Bad Request"});
    }
    if(!attendanceRec.error){
      console.log('insdide if');
      let foundByIdRec = await Attendance.findById(attendanceRec.id)
      if(foundByIdRec.attendance_status == 'Leave' && foundByIdRec.managerid){
        console.log('attendance manager id not null, calling create Notification');
        Notification.createNotificationRecord('attendance', foundByIdRec, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
      }
    }
    return res.status(201).json(attendanceRec);

  });

  // ......................................Get Attendance........................................
  router.get("/", fetchUser, async (req, res)=>{
    const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                        || el.name === permissions.MODIFY_ALL
                                                        || el.name === permissions.VIEW_ALL);
    if (!permission) return res.status(401).json({errors : "Unauthorized"});

    let userId =( req.userinfo.userrole == 'SUPER_ADMIN' ||req.userinfo.userrole == 'ADMIN') ? '' : req.userinfo.id;
    const attendance = await Attendance.getAttendance(userId);
    if(attendance){
      res.status(200).json(attendance);
    }else{
      res.status(400).json({errors : "No data"});
    }

  });

 

  router.get("/:id", fetchUser, async (req, res) => {
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.VIEW_LEAD ||
          el.name === permissions.MODIFY_ALL ||
          el.name === permissions.VIEW_ALL
      );
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
    //   Attendance.init(req.userinfo.tenantcode);
      let resultAttendance = await Attendance.findById(req.params.id);
      console.log('resultAttendance===' , resultAttendance)
      if (resultAttendance) {
        return res.status(200).json(resultAttendance);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.log("System Error:", error);
      return res.status(400).json({ success: false, message: error });
    }
  });


  router.put("/:id", fetchUser, async (req, res) => {
    console.log('req.userinfo===' , req.userinfo);
    try {
      const {status, remark} = req.body;
      const errors = [];
      const attendanceRec = {};
      
      if (req.body.hasOwnProperty("status")) {
        attendanceRec.status = status;
      };
      if (req.body.hasOwnProperty("remark")) {
        attendanceRec.remark = remark;
      };
      if (errors.length !== 0) {
        return res.status(400).json({ errors: errors });
      }
      let foundByIdRec = await Attendance.findById(req.params.id);

      if (foundByIdRec) {
        let updateResult = await Attendance.updateById( req.params.id, attendanceRec, req.userinfo.id);
        console.log('updateResult.data :>> ', updateResult.data);
        if (updateResult.data) {
          if(foundByIdRec.user_id){
            console.log('attendance manager id not null, calling create Notification');
            Notification.createNotificationRecord('attendance_response', updateResult.data, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
          }
          return res.status(200).json({ success: true, message: "Record updated successfully" });
        }
        return res.status(200).json(resultAttendance);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.log("error:", error);
      res.status(400).json({ errors: error });
    }
  });


  app.use(process.env.BASE_API_URL + '/api/attendance', router);
};