const sql = require("./db.js")
const global = require("../constants/global.js")

async function createAttendance(addAttendance) {
  console.log('addAttendance *==>',addAttendance);
  console.log('addAttendance user_id*==>',addAttendance.user_id);
  console.log('addAttendance Date*==>',addAttendance.date);
  const {
    attendance_status,
    date,
    leavetype,
    reason,
    status,
    remark,
    user_id,
  } = addAttendance
  // Check if a record already exists
  const existingRecord = await sql.query(
    "SELECT * FROM public.attendance WHERE user_id = $1 AND date = $2",
    [user_id, date]
  );
  console.log('existingRecord *==>',existingRecord);

  if (existingRecord.rowCount > 0) {
    return {error : 'Duplicate entry: Attendance for this user on the given date already exists.'}
  }
  else{
    const result = await sql.query(
      "INSERT into public.attendance (attendance_status, date, leavetype, reason, status, remark, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [attendance_status, date, leavetype, reason, status, remark, user_id]
    )
    if (result.rowCount > 0) {
      return result.rows[0]
    }
    return null
  }
}

async function getAttendance(userId) {
  try {
    var query =
      "SELECT att.*, DATE_PART('Year',  att.date) attendanceyear, DATE_PART('MONTH', att.date)  attendancemonth ,  concat(usr.firstname, ' ' ,usr.lastname) username FROM public.attendance att inner join public.user usr on att.user_id = usr.id"

    if (userId) {
      query += ` where att.user_id = '${userId}'`
    }
    query += ` order by date desc`
    result = await sql.query(query)
    return result.rows
  } catch (errMsg) {
    console.log("errMsg===>", errMsg)
  }
}

async function findById(id) {
  try {
    const result = await sql.query(
      `
        SELECT att.*, DATE_PART('Year',  att.date) attendanceyear, DATE_PART('MONTH', att.date)  attendancemonth ,  concat(usr.firstname, ' ' ,usr.lastname) username, usr.managerid 
        FROM public.attendance att 
        LEFT JOIN public.user usr ON att.user_id = usr.id 
        WHERE att.id = $1`,
      [id]
    )
    console.log('result.rows[0]:', result.rows[0]);
    return result.rows[0]
  } catch (errMsg) {
    console.log("errMsg===>", errMsg)
  }
}


async function updateById(id, updateRec) {
  try {
    const result = await sql.query(
      `UPDATE public.attendance SET status = $1, remark = $2 WHERE id = $3 RETURNING *`,
      [updateRec.status, updateRec.remark, id]
    )
    console.log('result.rows[0] :>> ', result.rows[0]);
    if (result.rowCount > 0) return { message : "Updated successfully", data : result.rows[0]}
  } catch (error) {
    console.log("error ", error)
  }

  return null
}

module.exports = {
  createAttendance,
  getAttendance,
  updateById,
  findById,
}
