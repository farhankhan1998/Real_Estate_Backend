const sql = require("../models/db.js")
const constants = require("../constants/global.js")
const Mailer = require("../models/mail.model.js")
const NotificationModel = require("../models/notification.model.js")

// Function to query the property and calculate lease days remaining
async function leaseExpirationNotificationScript() {
  try {
    console.log("inside leaseExpirationNotificationScript")
    // Query property data from the database where transaction type is Lease

    const queryResult = await sql.query(
      `SELECT *
        FROM ibs_sthapatya.property
        WHERE transactiontype = 'Lease'
        AND leaseexpirationdate > CURRENT_DATE`
    )

    console.log("get lease property result --> ", queryResult.rowCount)

    // Calculate days remaining for each property
    queryResult.rows.forEach((property) => {
      if (property.leaseexpirationdate) {
        // Convert leaseexpirationdate string to a Date object
        const leaseExpirationDate = new Date(property.leaseexpirationdate)

        // Calculate the time difference in milliseconds
        const timeDifference = leaseExpirationDate - new Date()

        // Convert milliseconds to days
        const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))

        console.log("daysRemaining-->", daysRemaining)
        if (constants.EXPIRATION_NOTIFICATION_DATES.includes(daysRemaining)) {
          console.log('in if');
          sendNotification(property, daysRemaining)
        }
      }
    })
  } catch (error) {
    // Handle database query error
    console.error("Error querying properties:", error)
    throw error
  }
}
// sends the automated email and notification
async function sendNotification(property, numberOfDaysRemaining){
  // querying super admin users
  let superAdminUser = await sql.query(`SELECT * FROM public.user WHERE userrole = 'SUPER_ADMIN'`)
  if(superAdminUser.rowCount > 0){
    let toAddresses = superAdminUser.rows.map(user => {
      return user?.email
    }).join(',')
    let email = {
      to: toAddresses/* 's.vigneshwar@Farhan Khanservices.com,sathish.s@Farhan Khanservices.com' */,
      subject: "Inventory expiration notification",
      body: ` Hi<br/><br/>
              The Inventory - <a href="${constants.DEPLOYED_HOST}/properties/${property.id}" target="_blank">${property?.name}</a> is having a expiration date as ${property?.leaseexpirationdate} which is ${numberOfDaysRemaining} of days remaining.
              <br/>Thanks<br/>
              <br/>Admin<br/>
              Company: Sthapatya Leasing`,
    }
    console.log('email :>> ', email);
    let fromEmail = Object.keys(JSON.parse(process.env.FROM_EMAIL))[0]
    console.log('fromEmail :>> ', fromEmail);
    Mailer.sendLeadAlertEmail(fromEmail || 'emailtesting.Farhan Khanservices@gmail.com', email);

    let recipient = {};
    superAdminUser.rows.forEach(user => {
      recipient[user.id] = 'notviewed'
    })
    console.log('recipient :>> ', recipient);
    let notification = {
      title: `Inventory expiry`,
      description: `${property?.name} is expiring on ${property?.leaseexpirationdate}`,
      recipients: recipient,
      navigationlink: `properties/${property.id}`,
    }
    console.log('notification :>> ', notification);
    // NotificationModel.create(notification, superAdminUser.rows[0]?.id, undefined, 'ibs_sthapatya')
  }
}
// leaseExpirationNotificationScript()
module.exports = { leaseExpirationNotificationScript }
