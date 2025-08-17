const sql = require("../models/db.js");
const constants = require("../constants/global.js");
const { createNotificationRecord } = require("../models/notification.model.js");

async function sendMeetingNotifications(app) {
  console.log("inside sendMeetingNotifications");
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
    // const seconds = String(date.getSeconds()).padStart(2, '0');
    // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const now = new Date();
  console.log("now *==>", now);

  const nowString = formatDate(now);
  console.log("nowString *==>", nowString);

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  console.log("tomorrow *==>", tomorrow);
  const tomorrowString = formatDate(tomorrow);
  console.log("tomorrowString *==>", tomorrowString);

  tomorrow.setHours(0, 0, 0, 0);

  //   const query = `
  //       SELECT * FROM ibs_sthapatya.task
  //       WHERE type = 'Meeting'
  //       AND (
  //           TO_CHAR(startdatetime, 'YYYY-MM-DD HH24:MI') = '${tomorrowString.slice(0, 16)}'
  //       )
  //   `;

  const query = `
    SELECT * FROM ibs_sthapatya.task
    WHERE type = 'Meeting'
    AND TO_CHAR(startdatetime, 'YYYY-MM-DD HH24') = '${tomorrowString.slice(0,13)}'
`;

  console.log("query *==>", query);
  const result = await sql.query(query);
  console.log("result *==>", result);
  result.rows.forEach((task) => {
    console.log("task *==>", task);
    const tenantcode = "ibs_sthapatya";
    createNotificationRecord(
      "meeting_reminder",
      task,
      task.ownerid,
      app.get("socket"),
      tenantcode
    );
  });
  return result;
}

async function sendDailyMeetingSummary(app) {
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const now = new Date();
  console.log("now *==>", now);

  const nowString = formatDate(now);
  console.log("nowString *==>", nowString);

  const query = ` SELECT * FROM ibs_sthapatya.task  WHERE type = 'Meeting' `;
  console.log("query *==>", query);
  const result = await sql.query(query);
  //console.log('result *==>', result);

  const meetings = result.rows;
  //console.log('meetings *==>', meetings);

  const meetingsToNotify = meetings.filter((meeting) => {
    //console.log('meeting *==>', meeting);
    const meetingDate = new Date(meeting.startdatetime);
    const meetingDateString = formatDate(meetingDate);
    console.log("meetingDateString *==>", meetingDateString);
    //  console.log('meetingDate *==>', meetingDate);
    console.log("nowString *==>", nowString);
    console.log("meetingDate > nowString *==>", meetingDateString == nowString);

    return meetingDateString == nowString;
  });

  console.log("meetingsToNotify *==>", meetingsToNotify);

  meetingsToNotify.forEach((task) => {
    const tenantcode = "ibs_sthapatya";
    createNotificationRecord(
      "daily_meeting_remainder",
      task,
      task.ownerid,
      app.get("socket"),
      tenantcode
    );
  });
}

module.exports = { sendMeetingNotifications, sendDailyMeetingSummary };
