/**
 * Handles all incoming request for /api/dailyTasks endpoint
 * DB table for this public.dailyTask
 * Model used here is dailyTask.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/dailyTasks/:pid/*
 *              GET     /api/dailyTasks/:id
 *              POST    /api/dailyTasks/:pid
 *              PUT     /api/dailyTasks/:id
 *              DELETE  /api/dailyTasks/:id
 *
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express")
const { fetchUser } = require("../middleware/fetchuser.js")
const DailyTask = require("../models/dailytask.model.js")
const permissions = require("../constants/permissions.js")
const Notification = require('../models/notification.model.js')


module.exports = (app) => {
  const { body, validationResult } = require("express-validator")

  var router = require("express").Router()

  // ..........................................Create DailyTask..........................................
  // Create a new DailyTask
  router.post(
    "/",
    fetchUser,
    [
      body("title", "Please enter title").isLength({ min: 1 }),
      body("ownerid", "Please select Assign staff").isUUID(),
    ],

    async (req, res) => {
      console.log("req.userinfo.id", req.userinfo.id)
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      DailyTask.init(req.userinfo.tenantcode)
      const dailyTaskRec = await DailyTask.create(req.body, req.userinfo.id)

      console.log("dailyTaskRec:", dailyTaskRec)
      if (!dailyTaskRec) {
        return res.status(400).json({ errors: "Bad Request" })
      }
      if(dailyTaskRec.ownerid){
        console.log('daily task ownerid is not null, calling create Notificatoin');
        Notification.createNotificationRecord('daily_task', dailyTaskRec, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
      }
      return res.status(201).json(dailyTaskRec)
    }
  )

  // .....................................Get DailyTask........................................

  router.get("/", fetchUser, async (req, res) => {
    console.log("in get dailytasks ")
    console.log("req.userinfo", req.userinfo)
    DailyTask.init(req.userinfo.tenantcode)
    const tasks = await DailyTask.findDailyTasks(req.userinfo)

    console.log("fetchDailyTasks:", tasks)
    res.status(200).json(tasks)
  })

  // .....................................Get DailyTask by id........................................

  router.get("/:id", fetchUser, async (req, res) => {
    console.log("in get dailytasks by id ")
    console.log("req.userinfo", req.userinfo)
    DailyTask.init(req.userinfo.tenantcode)
    const tasks = await DailyTask.findDailyTasksByid(req.params.id,req.userinfo)

    console.log("fetchDailyTasks:", tasks)
    if (tasks) {
      res.status(200).json(tasks)
    } else {
      res.status(400).json({ errors: "No data" })
    }
  })

  // //......................................Get DailyTask by OwnerId.................................
  // router.get("/ownerid/:ownerId/*", fetchUser, async (req, res) => {
  //   try {
  //     //Check permissions
  //     console.log("in getbyowner id")
  //     const permission = req.userinfo.permissions.find(
  //       (el) =>
  //         el.name === permissions.VIEW_LEAD ||
  //         el.name === permissions.MODIFY_ALL ||
  //         el.name === permissions.VIEW_ALL
  //     )
  //     if (!permission) return res.status(401).json({ errors: "Unauthorized" })
  //     DailyTask.init(req.userinfo.tenantcode)
  //     let resultTask = await DailyTask.findByOwnerId(req.params.ownerId)
  //     if (resultTask) {
  //       return res.status(200).json(resultTask)
  //     } else {
  //       return res
  //         .status(200)
  //         .json({ success: false, message: "No record found" })
  //     }
  //   } catch (error) {
  //     console.log("System Error:", error)
  //     return res.status(400).json({ success: false, message: error })
  //   }
  // })

  //.........................................Update DailyTask .....................................
  // Update a DailyTask with id
  router.put("/:id", fetchUser, async (req, res) => {
    try {
      const {
        title,
        priority,
        status,
        description,
        targetdate,
        details,
        emailsreceived,
        emailsrepliedexceptproposalsend,
        underconstructionproperties,
        followuptaken,
        completionofconstruction,
        sellerleadgenerated,
        sellerleadconfirmed,
        followuptakenfrompotentialsellers,
        ppt,
        proposalsend,
        onlineplatformupdate,
        clientdatabasedupdated,
        crmupdate,
        otherwork1,
        otherwork2,
        otherwork3,
        otherwork4,
        ownerid,
        createdbyid,
        lastmodifiedbyid,
      } = req.body
      const errors = []
      const dailyTaskRec = {}

      if (req.body.hasOwnProperty("title")) {
        if (!title) {
          errors.push("Title is required")
        }
        dailyTaskRec.title = title
      }
      if (req.body.hasOwnProperty("priority")) {
        dailyTaskRec.priority = priority
      }
      if (req.body.hasOwnProperty("status")) {
        dailyTaskRec.status = status
      }
      if (req.body.hasOwnProperty("description")) {
        dailyTaskRec.description = description
      }
      // if (req.body.hasOwnProperty("targetdate")) {
      //   dailyTaskRec.targetdate = targetdate
      // }
      if (req.body.hasOwnProperty("targetdate")) {
        dailyTaskRec.targetdate = req.body.targetdate !== "" ? req.body.targetdate : null;
      }
      if (req.body.hasOwnProperty("details")) {
        dailyTaskRec.details = details
      }
      if (req.body.hasOwnProperty("emailsreceived")) {
        dailyTaskRec.emailsreceived = emailsreceived
      }
      if (req.body.hasOwnProperty("emailsrepliedexceptproposalsend")) {
        dailyTaskRec.emailsrepliedexceptproposalsend =
          emailsrepliedexceptproposalsend
      }
      if (req.body.hasOwnProperty("underconstructionproperties")) {
        dailyTaskRec.underconstructionproperties = underconstructionproperties
      }
      if (req.body.hasOwnProperty("followuptaken")) {
        dailyTaskRec.followuptaken = followuptaken
      }
      if (req.body.hasOwnProperty("completionofconstruction")) {
        dailyTaskRec.completionofconstruction = completionofconstruction
      }
      if (req.body.hasOwnProperty("sellerleadgenerated")) {
        dailyTaskRec.sellerleadgenerated = sellerleadgenerated
      }
      if (req.body.hasOwnProperty("sellerleadconfirmed")) {
        dailyTaskRec.sellerleadconfirmed = sellerleadconfirmed
      }
      if (req.body.hasOwnProperty("followuptakenfrompotentialsellers")) {
        dailyTaskRec.followuptakenfrompotentialsellers =
          followuptakenfrompotentialsellers
      }
      if (req.body.hasOwnProperty("ppt")) {
        dailyTaskRec.ppt = ppt
      }
      if (req.body.hasOwnProperty("proposalsend")) {
        dailyTaskRec.proposalsend = proposalsend
      }
      if (req.body.hasOwnProperty("onlineplatformupdate")) {
        dailyTaskRec.onlineplatformupdate = onlineplatformupdate
      }
      if (req.body.hasOwnProperty("clientdatabasedupdated")) {
        dailyTaskRec.clientdatabasedupdated = clientdatabasedupdated
      }
      if (req.body.hasOwnProperty("crmupdate")) {
        dailyTaskRec.crmupdate = crmupdate
      }
      if (req.body.hasOwnProperty("otherwork1")) {
        dailyTaskRec.otherwork1 = otherwork1
      }
      if (req.body.hasOwnProperty("otherwork2")) {
        dailyTaskRec.otherwork2 = otherwork2
      }
      if (req.body.hasOwnProperty("otherwork3")) {
        dailyTaskRec.otherwork3 = otherwork3
      }
      if (req.body.hasOwnProperty("otherwork4")) {
        dailyTaskRec.otherwork4 = otherwork4
      }
      if (req.body.hasOwnProperty("ownerid")) {
        if (!ownerid) {
          errors.push("Assign staff is required")
        }
        dailyTaskRec.ownerid = ownerid
      }
      if (req.body.hasOwnProperty("createdbyid")) {
        dailyTaskRec.createdbyid = createdbyid
      }
      if (req.body.hasOwnProperty("lastmodifiedbyid")) {
        dailyTaskRec.lastmodifiedbyid = lastmodifiedbyid
      }

      if (errors.length !== 0) {
        return res.status(400).json({ errors: errors })
      }

      DailyTask.init(req.userinfo.tenantcode)
      let resultTask = await DailyTask.findDailyTasksByid(req.params.id, req.userinfo)

      console.log("res", resultTask)

      if (resultTask) {
        console.log("resultTask:", resultTask)
        resultTask = await DailyTask.updateById( req.params.id, dailyTaskRec, req.userinfo.id )
        if (resultTask) {
          return res.status(200).json({ success: true, message: "Record updated successfully", data : resultTask })
        }
        return res.status(200).json(resultTask)
      } else {
        return res.status(200).json({ success: false, message: "No record found" })
      }
    } catch (error) {
      res.status(400).json({ errors: error })
    }
  })

  // Delete a DailyTask with id
  router.delete("/:id", fetchUser, async (req, res) => {
    DailyTask.init(req.userinfo.tenantcode)
    const result = await DailyTask.deleteTask(req.params.id)
    if (!result)
      return res.status(200).json({ success: false, message: "No record found" })

    res.status(400).json({ success: true, message: "Successfully Deleted" })
  })

  app.use(process.env.BASE_API_URL + "/api/dailytasks", router)
}
