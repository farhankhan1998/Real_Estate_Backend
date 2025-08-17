const e = require('express');
const emailModel = require('../models/email.model.js'); 
const { fetchUser } = require("../middleware/fetchuser.js");
const permissions = require("../constants/permissions.js");


module.exports = (app) => {
  var router = require("express").Router()

// -------------------------Create-----------------------------------------------------------------------
router.post('/',fetchUser,[],
 async (req, res) => {
  const permission = req.userinfo.permissions.find(el => el.name === permissions.EDIT_LEAD 
  || el.name === permissions.MODIFY_ALL);
if (!permission) return res.status(401).json({errors : "Unauthorized"});

emailModel.init(req.userinfo.tenantcode);
  try {
    const { toaddress, fromaddress, ccaddress, subject, body, attachments, pdf, parentid } = req.body;

    const newEmail = await emailModel.createEmail({
      toaddress,
      fromaddress,
      ccaddress,
      subject,
      body,
      attachments,
      pdf,
      parentid,
    });

    res.status(201).json(newEmail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ----------------------------GetById---------------------------------------------------------
router.get('/:id',fetchUser, async (req, res) => {
 
  try {
    emailModel.init(req.userinfo.tenantcode);
    const email = await emailModel.findById(req.params.id);
    console.log('email:', email);
    if (email) {
      res.json(email);
    } else {
      res.status(404).json({ error: 'Email not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------------------------GetAll-----------------------------------------------------------------
router.get('/:parentid/all',fetchUser, async (req, res) => {
  try {
    emailModel.init(req.userinfo.tenantcode);
    const emails = await emailModel.findByParent(req.params.parentid);
    res.json(emails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.use(process.env.BASE_API_URL + "/api/email", router)
}