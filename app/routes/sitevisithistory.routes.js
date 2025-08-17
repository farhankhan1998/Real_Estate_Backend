const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const sitevisithistory = require("../models/sitevisithistory.model.js");
const permissions = require("../constants/permissions.js");
const Notification = require('../models/notification.model.js')
const propertyModel = require("../models/property.model.js");
var validator = require('validator');


module.exports = app => {
  

  const { body, validationResult } = require('express-validator');
  var router = require("express").Router();

  // ..............................Create sitevisithistory..........................................
  router.post("/", fetchUser, [
    body('fieldpersonid', 'Please select Field person').isUUID()
  ] ,
  
  async (req, res)=>{
    //Check permissions

    // const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL);
    // if (!permission) 
    //     return res.status(401).json({errors : "Unauthorized"});

console.log('req body *==>',req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors : errors.array()});
    }
    sitevisithistory.init(req.userinfo.tenantcode); 
    const objRec = await sitevisithistory.create(req.body, req.userinfo.id);
    ////console.log('objRec:', objRec);
    if(!objRec){
      return res.status(400).json({errors : "Bad Request"});
    }
    if(objRec.fieldpersonid){
      console.log('sitevisit fieldpersonid is not null, calling create Notificatoin');
      Notification.createNotificationRecord('sitevisit', objRec, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
    }
    return res.status(201).json(objRec);
  });


  // ..............................Create Inventory  ........................................

  router.post("/convert-inventory/:sitevisithistoryid", fetchUser, async (req, res) => {
    try {
      const permission = req.userinfo.permissions.find(el =>
        el.name === permissions.VIEW_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL
      );
      if (!permission)
        return res.status(401).json({ errors: "Unauthorized" });
  
      sitevisithistory.init(req.userinfo.tenantcode);
      const sitevisithistoryId = req.params.sitevisithistoryid;
      console.log('sitevisithistoryId *==>',sitevisithistoryId)
  
      const sitevisithistoryRecord = await sitevisithistory.findById(sitevisithistoryId);
      console.log('sitevisithistoryRecord *==>',sitevisithistoryRecord)

  
      if (!sitevisithistoryRecord) {
        console.log('inside if *===>')
        return res.status(404).json({ errors: "Sitevisithistory not found" });
      }
      
      if(sitevisithistoryRecord.status !== 'Visited'){
        return res.status(404).json({ errors: "Please change the status to Visited to convert to inventory" });
      }
  
      const siteName = sitevisithistoryRecord.sitename;
      console.log('siteName *==>',siteName)

  
      propertyModel.init(req.userinfo.tenantcode);
      const createdInventory = await propertyModel.create({ name: siteName }, req.userinfo.id);
      console.log('createdInventory *==>',createdInventory)

  
      if (!createdInventory) {
        console.log('inside createdInventory if *===>')

        return res.status(500).json({ errors: "Error creating inventory" });
      }
  
      const updatedSitevisithistory = await sitevisithistory.updateById(
        sitevisithistoryId,
        { siteid: createdInventory.id },null,null,null,
        req.userinfo.id
      );
      console.log('updatedSitevisithistory *==>',updatedSitevisithistory)

  
      if (!updatedSitevisithistory) {
        console.log('inside updatedSitevisithistory if *===>')

        return res.status(500).json({ errors: "Error updating sitevisithistory" });
      }
  
      return res.status(200).json({
        message: "Inventory created",
        data: updatedSitevisithistory
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ errors: "Internal Server Error" });
    }
  });

  // ..............................Get All sitevisithistory........................................
  router.get("/", fetchUser, async (req, res)=>{
     //Check permissions
     console.log('in get all')
    //  const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_ATTENDANCE || el.name === permissions.LIST_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL);
    // if (!permission) 
    //     return res.status(401).json({errors : "Unauthorized"});

    ////console.log('=========');
    sitevisithistory.init(req.userinfo.tenantcode); 
    const allRecords = await sitevisithistory.findAll();
    ////console.log('allRecords:', allRecords);
    if(allRecords){
      res.status(200).json(allRecords);
    }else{
      res.status(400).json({errors : "No data"});
    }

  });

  // .....................................Get sitevisithistory by Id........................................
  router.get("/:id", fetchUser, async (req, res)=>{
    try {
        console.log('in get by id')
      // const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_ATTENDANCE || el.name === permissions.LIST_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL);
      // if (!permission) 
      //   return res.status(401).json({errors : "Unauthorized"});


      ////console.log('req.id:', req.id);
      sitevisithistory.init(req.userinfo.tenantcode); 
      let resultObj = await sitevisithistory.findById(req.params.id);
      if(resultObj){
        return res.status(200).json(resultObj);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      return res.status(400).json({"success" : false, "message"  : error});
    }

  });

  //.........................................Update sitevisithistory .....................................
  router.put("/:id", fetchUser,  async (req, res)=>{
    try {
      const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL);
      if (!permission) 
          return res.status(401).json({errors : "Unauthorized"});

        const {title, status, description, fieldpersonid, siteid, targetdate, checkintime, checkouttime, checkinlattitude, checkinlongitude, checkoutlattitude, checkoutlongitude, remarks, location, sitename,ownername,owneractnumber,secondcontactpersonname,email,propertytype,propertyapprovalstatus,floormapavailable,firenocavailble,nooffloor,propertyarea,eachfloorheight,frontage,noofentries,liftavailable,parkingspace,previousbrand,locationarea,expectedrent,secondcontactpersonphone ,        areadetails,
          heightdetails , pricingorrental} = req.body;
        const errors = [];
        const objRec = {};

        if(req.body.hasOwnProperty("title")){objRec.title = title};
        if(req.body.hasOwnProperty("status")){objRec.status = status};
        if(req.body.hasOwnProperty("description")){objRec.description = description};
        if(req.body.hasOwnProperty("fieldpersonid")){objRec.fieldpersonid = fieldpersonid};
        if(req.body.hasOwnProperty("sitename")){objRec.sitename = sitename};
        if(req.body.hasOwnProperty("targetdate")){objRec.targetdate = targetdate};
        if(req.body.hasOwnProperty("checkintime")){objRec.checkintime = checkintime};
        if(req.body.hasOwnProperty("checkouttime")){objRec.checkouttime = checkouttime};
        if(req.body.hasOwnProperty("checkinlattitude")){objRec.checkinlattitude = checkinlattitude};
        if(req.body.hasOwnProperty("checkinlongitude")){objRec.checkinlongitude = checkinlongitude};
        if(req.body.hasOwnProperty("checkoutlattitude")){objRec.checkoutlattitude = checkoutlattitude};
        if(req.body.hasOwnProperty("checkoutlongitude")){objRec.checkoutlongitude = checkoutlongitude};
        if(req.body.hasOwnProperty("remarks")){objRec.remarks = remarks};
        if(req.body.hasOwnProperty("location")){objRec.location = location};
        if (req.body.hasOwnProperty("ownername")) { objRec.ownername = ownername};
if (req.body.hasOwnProperty("owneractnumber")) { objRec.owneractnumber = owneractnumber};
if (req.body.hasOwnProperty("secondcontactpersonname")) { objRec.secondcontactpersonname = secondcontactpersonname};
if (req.body.hasOwnProperty("email")) { objRec.email = email};
if (req.body.hasOwnProperty("propertytype")) { objRec.propertytype = propertytype};
if (req.body.hasOwnProperty("propertyapprovalstatus")) { objRec.propertyapprovalstatus = propertyapprovalstatus};
if (req.body.hasOwnProperty("floormapavailable")) { objRec.floormapavailable = floormapavailable};
if (req.body.hasOwnProperty("firenocavailble")) { objRec.firenocavailble = firenocavailble};
if (req.body.hasOwnProperty("nooffloor")) { objRec.nooffloor = nooffloor};
if (req.body.hasOwnProperty("propertyarea")) { objRec.propertyarea = propertyarea};
if (req.body.hasOwnProperty("eachfloorheight")) { objRec.eachfloorheight = eachfloorheight};
if (req.body.hasOwnProperty("frontage")) { objRec.frontage = frontage};
if (req.body.hasOwnProperty("noofentries")) { objRec.noofentries = noofentries};
if (req.body.hasOwnProperty("liftavailable")) { objRec.liftavailable = liftavailable};
if (req.body.hasOwnProperty("parkingspace")) { objRec.parkingspace = parkingspace};
if (req.body.hasOwnProperty("previousbrand")) { objRec.previousbrand = previousbrand};
if (req.body.hasOwnProperty("locationarea")) { objRec.locationarea = locationarea};
if (req.body.hasOwnProperty("expectedrent")) { objRec.expectedrent = expectedrent};
if (req.body.hasOwnProperty("secondcontactpersonphone")) { objRec.secondcontactpersonphone = secondcontactpersonphone};

        if(req.body.hasOwnProperty("sitename")){
          if(validator.isUUID(siteid ? siteid : '')){
            objRec.siteid = siteid
          }
        };
        
        console.log('=======', objRec);

        if(errors.length !== 0){
          return res.status(400).json({errors : errors});
        }
        sitevisithistory.init(req.userinfo.tenantcode); 
        let resultObj = await sitevisithistory.findById(req.params.id);
        ////console.log('=======');
        if(resultObj){
          resultObj = await sitevisithistory.updateById(req.params.id, objRec,areadetails,heightdetails,pricingorrental,req.userinfo.id);
          console.log('resultObj *==>',resultObj);
          if(resultObj){
            let findByIdResult = await sitevisithistory.findById(req.params.id);
            return res.status(200).json(findByIdResult);
          }
          return res.status(200).json(resultObj);
        }else{
          return res.status(200).json({"success" : false, "message"  : "No record found"});
        }
    
    } catch (error) {
        res.status(400).json({errors : error});
    }

  });

  // // ..............................Get tracking currentrecord........................................
  // router.get("/staff/:staffid", fetchUser, async (req, res)=>{
  //   ////console.log('=========user tracking=====');
    
  //   if(req.userinfo.userrole == 'USER') {
  //     res.status(400).json({errors : "Unauthorized"});
  //     return;
  //   }
    
  //   const permission = req.userinfo.permissions.find(el =>  el.name === permissions.LIST_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL);
  //   if (!permission) 
  //       return res.status(401).json({errors : "Unauthorized"});

  //       sitevisithistory.init(req.userinfo.tenantcode); 
  //   ////console.log('====get staff history=====');
  //   let staffId = req.params.staffid;
  //   const allRecords = await sitevisithistory.getStaffLoginHistory(staffId);
  //   if(allRecords){
  //     res.status(200).json(allRecords);
  //   }else{
  //     res.status(400).json({errors : "No data"});
  //   }

  // });


  // // ..............................Get tracking currentrecord........................................
  // router.get("/track/currentrecord", fetchUser, async (req, res)=>{
  //   const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_ATTENDANCE || el.name === permissions.VIEW_ALL || el.name === permissions.MODIFY_ALL);
  //   if (!permission) 
  //       return res.status(401).json({errors : "Unauthorized"});
  //       sitevisithistory.init(req.userinfo.tenantcode);  
  //   const allRecords = await sitevisithistory.findCurrentRecordByUserId(req.userinfo.id);
  //   ////console.log('allRecords:', allRecords);
  //   if(allRecords){
  //     res.status(200).json(allRecords);
  //   }else{
  //     res.status(200).json({errors : "No data"});
  //   }

  // });


  // ...............................................Delete sitevisithistory......................................
  router.delete("/:id", fetchUser, async (req, res) => {
    sitevisithistory.init(req.userinfo.tenantcode); 
    const result = await sitevisithistory.deletesitevisithistory(req.params.id);
    if(!result)
      return res.status(200).json({"success" : false, "message"  : "No record found"});
    
      res.status(400).json({"success" : true, "message"  : "Successfully Deleted"});
  });

  app.use(process.env.BASE_API_URL + '/api/sitevisithistory', router);
};

