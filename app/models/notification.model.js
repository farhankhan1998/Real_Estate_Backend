const sql = require("./db.js")
const AUTH = require("./auth.model.js");

let schema = ""

function init(schema_name) {
  this.schema = schema_name
}

const selectByIdQuery = (schema, filter) => {
  let query = `SELECT notification.*, concat(us.firstname, ' ', us.lastname) as createdbyname FROM ${schema}.notification 
               LEFT JOIN public.user us ON us.id = notification.createdbyid`
  if (filter) {
    query = query + " WHERE " + filter
  }
  query = query + " ORDER BY  notification.createddate DESC "
  return query
}

async function create(newNotification, userid, socket, schema) {
  try {
    const result = await sql.query(
      `INSERT INTO ${this.schema || schema}.notification (title, description, recipients, navigationlink, createdbyid)
       SELECT $1, $2, $3, $4, $5 FROM public.user WHERE id = $5 RETURNING *, 
       (SELECT firstname || ' ' || lastname FROM public.user WHERE id = $5) AS createdbyname`,
      [
        newNotification.title,
        newNotification.description,
        JSON.stringify(newNotification.recipients),
        newNotification.navigationlink,
        userid,
      ]
    )

    if (result.rowCount > 0) {
      if(socket){
        console.log("socket in ", socket)
        socket.emit("notification_inserted", { message: "Notification inserted" })
      }
      return {
        statusCode: 201,
        data: result.rows[0],
        errors: "",
        message: "Notification has been created successfully!",
      }
    } else {
      return {
        statusCode: 400,
        message: "Insert Notification failed",
      }
    }
  } catch (error) {
    console.log("error in Notification create method - ", error)
    return {
      statusCode: 500,
      errors: error.message,
      data: {},
      message: "",
    }
  }
}

async function findByRecipientId(schema, id) {
  try {
    let query = selectByIdQuery(schema, ` recipients->>'${id}' IS NOT NULL`)

    const result = await sql.query(query)

    if (result.rows.length > 0) {
      return {
        statusCode: 200,
        data: result.rows,
        message: "Notification Record Found By recipient ID",
        errors: "",
      }
    } else {
      return {
        data: [],
        statusCode: 200,
        message: "No Record Found",
      }
    }
  } catch (error) {
    console.log("error in Notification Find method - ", error)
    return {
      statusCode: 500,
      errors: error.message,
      data: {},
      message: "",
    }
  }
}

async function deleteById(id, userId) {
  try {
    let selectResult = await sql.query(
      `SELECT * FROM ${this.schema}.notification WHERE id = $1`,
      [id]
    )
    if (selectResult.rowCount > 0) {
      let recipients = selectResult.rows[0].recipients
      if (recipients?.[userId]) {
        delete recipients[userId]
        console.log("recipients :>> ", recipients, Object.keys(recipients))
        if (Object.keys(recipients).length === 0) {
          let deleteResult = await sql.query(
            `DELETE FROM ${this.schema}.notification WHERE id = $1`,
            [id]
          )
          console.log("deleteResult.rowCount :>> ", deleteResult.rowCount)
          if (deleteResult.rowCount > 0) {
            return {
              statusCode: 200,
              errors: "",
              message: "Notification Deleted Successfully",
            }
          } else {
            return {
              statusCode: 400,
              errors: "",
              message: "Error while deleting notification",
            }
          }
        } else {
          let updateResult = await sql.query(
            `UPDATE ibs_sthapatya.notification SET recipients = $1 WHERE id = $2`,
            [recipients, id]
          )
          console.log("updateResult :>> ", updateResult)
          if (updateResult.rowCount > 0) {
            return {
              statusCode: 200,
              errors: "",
              message: "Notification Deleted Successfully",
            }
          } else {
            return {
              statusCode: 400,
              errors: "",
              message: "Error while deleting notification",
            }
          }
        }
      }
    } else {
      return { statusCode: 400, message: "No Record Found" }
    }
  } catch (error) {
    console.log("error in Notification Delete method - ", error)
    return {
      statusCode: 500,
      errors: error.message,
      message: "Error occurred while deleting the Notification",
      data: {},
    }
  }
}

async function deleteAll(userId) {
  try {
    let selectResult = await sql.query(
      `SELECT * FROM ${this.schema}.notification WHERE recipients->>'${userId}' IS NOT NULL`
    )
    if (selectResult.rowCount > 0) {
      for (const each of selectResult.rows) {
        let recipients = each.recipients
        let id = each.id
        if (recipients?.[userId]) {
          delete recipients[userId]
          console.log("recipients :>> ", recipients, Object.keys(recipients))
          if (Object.keys(recipients).length === 0) {
            let deleteResult = await sql.query(
              `DELETE FROM ${this.schema}.notification WHERE id = $1`,
              [id]
            )
            console.log("deleteResult.rowCount :>> ", deleteResult.rowCount)
            // if (deleteResult.rowCount > 0) {
            //   return { statusCode: 200, errors: "", message: "Notification Deleted Successfully", }
            // } else {
            //   return { statusCode: 400, errors: "", message: "Error while deleting notification", }
            // }
          } else {
            let updateResult = await sql.query(
              `UPDATE ibs_sthapatya.notification SET recipients = $1 WHERE id = $2`,
              [recipients, id]
            )
            console.log("updateResult :>> ", updateResult)
            // if (updateResult.rowCount > 0) {
            //   return { statusCode: 200, errors: "", message: "Notification Deleted Successfully", }
            // } else {
            //   return { statusCode: 400, errors: "", message: "Error while deleting notification", }
            // }
          }
        }
      }
      return {
        statusCode: 200,
        errors: "",
        message: "Notifications Deleted Successfully",
      }
    } else {

      return {
        data: [],
        statusCode: 200,
        message: "No Record Found",
      }
    }
  } catch (error) {
    console.log("error in Notification Delete method - ", error)
    return {
      statusCode: 500,
      errors: error.message,
      message: "Error occurred while deleting the Notification",
      data: {},
    }
  }
}

async function updateById(id, userid) {
  try {
    let updateQuery = `UPDATE ibs_sthapatya.notification SET recipients[$1] = '"viewed"' WHERE id = $2 RETURNING *`

    const result = await sql.query(updateQuery, [userid, id])

    if (result.rowCount > 0) {
      let query = selectByIdQuery(this.schema, ` recipients->>'${userid}' IS NOT NULL` )
      console.log('query in update :>> ', query);
      const selectResult = await sql.query(query)

      if (selectResult.rowCount > 0) {
        return {
          statusCode: 200,
          data: selectResult.rows,
          message: "Notification updated successfully!",
          errors: "",
        }
      } else {
        return {
          data: result.rows[0],
          statusCode: 200,
          errors: "",
          message: "Notification updated successfully!",
        }
      }
    } else {
      return {
        data: [],
        statusCode: 200,
        message: "No Records Found",
      }
    }
  } catch (error) {
    console.log("error in Notification update method - ", error)
    return {
      statusCode: 500,
      errors: error.message,
      data: {},
      message: "",
    }
  }
}

async function createNotificationRecord(notificationFor, record, createdById, socket, schema) {
  // title, description, recipients, navigationlink
  console.log('in createdNotification');
  // console.log('notificationFor *==>',notificationFor);
  // console.log('record *==>',record);
  // console.log('createdById *==>',createdById);

  let allSystemAdmin = await AUTH.getAllManager();
  //console.log('allSystemAdmin *==>',allSystemAdmin);
  let recipient = {}
  if(allSystemAdmin){
    for(const each of allSystemAdmin){
      if(each.id){
        recipient[each.id] = "notviewed"
      }
    }
  }
  if (notificationFor == "lead_create") {
    recipient[record.ownerid] =  "notviewed"
    let notification = {
      title: "New Lead Created",
      description: "Check out the newly created lead",
      recipients: recipient,
      navigationlink: `/leads/${record.id}`,
    }
    create(notification, createdById, socket, schema)
    return
  }
  if (notificationFor == "lead_assign") {
    let notification = {
      title: "New Lead assigned",
      description: "Start working on the assigned lead.",
      recipients: {
        [record.ownerid]: "notviewed",
      },
      navigationlink: `/leads/${record.id}`,
    }
    create(notification, createdById, socket, schema)
    return
  }
  if (notificationFor == "lead_reassign") {
    let notification = {
      title: "Lead reassigned to you",
      description: "Start working on the reassigned lead.",
      recipients: {
        [record.ownerid]: "notviewed",
      },
      navigationlink: `/leads/${record.id}`,
    }
    create(notification, createdById, socket, schema)
    return
  }
  if (notificationFor == "lead_stage") {
    recipient[record.ownerid] =  "notviewed"
    let notification = {
      title: "Lead stage changed",
      description: `Stage changed to ${record.leadstage}`,
      recipients: recipient,
      navigationlink: `/leads/${record.id}`,
    }
    create(notification, createdById, socket, schema)
    return
  }
  if (notificationFor == "daily_task") {
    let notification = {
      title: "New Task assigned",
      description: "Start working on the assigned task.",
      recipients: {
        [record.ownerid]: "notviewed",
      },
      navigationlink: `/dailytasklist/${record.id}`,
    }
    create(notification, createdById, socket, schema)
    return
  }
  if (notificationFor == "sitevisit") {
    let notification = {
      title: "New Site visit assigned",
      description: "Start working on the assigned Site visit.",
      recipients: {
        [record.fieldpersonid]: "notviewed",
      },
      navigationlink: `/sitevisit/${record.id}`,
    }
    create(notification, createdById, socket, schema)
    return
  }
  if (notificationFor == "attendance") {
    console.log('inside attendance *==>');
    console.log('recipient *==>',recipient);
    console.log('record user_id*==>',record.user_id);
    if (record.user_id) {
      console.log('record user_id*==>', record.user_id);
      delete recipient[record.user_id];
    }
    console.log('recipient after*==>',recipient);
    let notification = {
      title: "New Leave Request",
      description: `${record.username} is requesting ${record.leavetype} ${record.attendance_status} On ${record.date}`,
      recipients: recipient,
      navigationlink: `/attendance`,
    }
    console.log('notification *==>',notification);
    create(notification, createdById, socket, schema)
    return
  }
  // if (notificationFor == "attendance") {
  //   console.log('inside attendance *==>');
  //   let notification = {
  //     title: "New Leave Request",
  //     description: `${record.username} is requesting ${record.leavetype} ${record.attendance_status} On ${record.date}`,
  //     recipients: {
  //       [record.managerid]: "notviewed",
  //     },
  //     navigationlink: `/attendance`,
  //   }
  //   create(notification, createdById, socket, schema)
  //   return
  // }
  if (notificationFor == "attendance_response") {
    let notification = {
      title: `Leave Request ${record.status}`,
      description: `Your ${record.leavetype} request on ${record.date} is ${record.status}`,
      recipients: {
        [record.user_id]: "notviewed",
      },
      navigationlink: `/attendance`,
    }
    create(notification, createdById, socket, schema)
    return
  }
  if (notificationFor === 'meeting_reminder') {
    console.log('record.startdatetime *==>',record.startdatetime);
    let notification = {
      title: "Meeting Reminder",
      // description: `Reminder: You have a meeting scheduled for Tomorrow at ${record.startdatetime}.`,
      description: `Meeting scheduled for Tomorrow at ${record.startdatetime}.`,
      recipients: recipient,
      navigationlink: `/meetings/${record.id}`,
    };
    create(notification, createdById, socket, schema);
    return;
  }
  if (notificationFor === 'daily_meeting_remainder') {
    console.log('record.ownerid *==>',record.ownerid);
    let notification = {
      title: "Meeting Reminder",
      description: `Today's Meeting's Schedule ${record.startdatetime}.`,
      recipients: recipient,
      navigationlink: `/meetings`,
    };
    create(notification, createdById, socket, schema);
    return;
  }
}

module.exports = {
  init,
  create,
  deleteById,
  updateById,
  findByRecipientId,
  deleteAll,
  createNotificationRecord
}
