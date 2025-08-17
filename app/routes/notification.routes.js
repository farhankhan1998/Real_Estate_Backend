const { fetchUser } = require("../middleware/fetchuser.js")
const notificationModel = require("../models/notification.model.js")
const { body, validationResult } = require("express-validator")

module.exports = (app) => {
  var router = require("express").Router()

  // Create a new notification
  router.post(
    "/",
    fetchUser,
    [
      body("title", "Please enter title").isLength({ min: 1 }),
      body("recipients", "Please enter recipients").isLength({ min: 1 }),
      body("navigationlink", "Please enter navigationlink").isLength({
        min: 1,
      }),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
        }

        notificationModel.init(req.userinfo.tenantcode)
        let socket = app.get('socket')
        const newNotification = await notificationModel.create( req.body, req.userinfo.id, socket )

        if (newNotification.statusCode === 201) {
          // console.log("file: notification.routes.js:50 - router.get - socket - ", socket)
          // socket.emit("notification_inserted", {message : "Notification inserted"});
          res.status(201).json(newNotification)
        } else {
          res.status(newNotification.statusCode).json(newNotification)
        }
      } catch (error) {
        console.error(error)
        res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message })
      }
    }
  )

  // Get all notifications for current user
  router.get("/", fetchUser, async (req, res) => {
    try {
      notificationModel.init(req.userinfo.tenantcode)
      console.log('user info *==>',req.userinfo)
      const notifications = await notificationModel.findByRecipientId(req.userinfo.tenantcode,
        req.userinfo.id
      )
      // let socket = app.get('socket')
      // console.log("file: notification.routes.js:50 - router.get - socket - ", socket)
      // socket.emit("notification_inserted", {message : "Notification inserted"});
      res.status(notifications.statusCode).json(notifications)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error", details: error.message  })
    }
  })

  // Update notification as viewed
  router.put("/:id", fetchUser, async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      notificationModel.init(req.userinfo.tenantcode)
      const updatedNotification = await notificationModel.updateById(
        req.params.id,
        req.userinfo.id
      )

      res.status(updatedNotification.statusCode).json(updatedNotification)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error", details : error.message })
    }
  })
  
  // removes the user id from all notification record
  router.delete("/all", fetchUser, async (req, res) => {
    console.log('in all routes');
    try {
      notificationModel.init(req.userinfo.tenantcode)
      const result = await notificationModel.deleteAll(req.userinfo.id)
      res.status(result.statusCode).json(result)      
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error", details : error.message })
    }
  })

  // Removes user id from the recipient. 
  // After removing, if the recipient is empty, logic will delete the record
  router.delete("/:id", fetchUser, async (req, res) => {
    try {
      notificationModel.init(req.userinfo.tenantcode)
      const result = await notificationModel.deleteById(req.params.id, req.userinfo.id)
      res.status(result.statusCode).json(result)      
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal Server Error", details : error.message })
    }
  })

  app.use(process.env.BASE_API_URL + "/api/notification", router)
}
