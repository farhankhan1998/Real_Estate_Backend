  /**
 * Handles all incoming request for /api/auth endpoint
 * DB table for this public.user
 * Model used here is auth.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/auth/getuser
 *              POST    /api/createuser
 *              POST     /api/login
 *
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const Auth = require("../models/auth.model.js");
const { fetchUser } = require("../middleware/fetchuser.js");
const File = require("../models/file.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { log } = require("console");

module.exports = (app) => {
  const { body, validationResult } = require("express-validator");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post(
    "/createuser",
    fetchUser,
    [
      body("email", "Please enter email").isEmail(),
      body("password", "Please enter password").isLength({ min: 6 }),
      body("firstname", "Please enter firstname").isLength({ min: 2 }),
      body("lastname", "Please enter lastname").isLength({ min: 2 }),
    ],

    async (req, res) => {
      // #swagger.tags = ['Users']
      // #swagger.path = ['/api/auth/createuser']
      const {
        firstname,
        lastname,
        email,
        joiningdate,
        leavingdate,
        phone,
        password,
        userrole,
        isactive
      } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const salt = bcrypt.genSaltSync(10);
      const secPass = bcrypt.hashSync(req.body.password, salt);

      const userRec = await Auth.findByEmail(email);
      if (userRec) {
        return res
          .status(400)
          .json({ errors: "User already exist with given email." });
      }

      const allowedLicenses = await Auth.checkLicenses(req.userinfo.companyid);
      console.log('allowedLicenses *==>',allowedLicenses);
      if (!allowedLicenses) {
        return res.status(400).json({ errors: "Licenses limit exceeded" });
      }

      const newUser = await Auth.createUser({
        firstname: firstname,
        lastname: lastname,
        email: email,
        phone:phone,
        password: secPass,
        userrole: userrole,
        joiningdate: joiningdate,
        leavingdate: leavingdate,
        isactive:isactive,
        companyid: req.userinfo.companyid,
      });
      if (newUser) {
        const data = {
          id: newUser.id,
        };

        const authToken = jwt.sign(data, process.env.JWT_SECRET);

        const newRole = await Auth.setRole(userrole, newUser);
        console.log(newRole);

        return res
          .status(201)
          .json({ success: true, id: newUser.id, authToken: authToken });
      } else return res.status(400).json({ errors: "Bad request" });

      // contacts.create(req, res);
    }
  );

  // Create a new Tutorial
  router.post("/login",[
    body('email', 'Please enter firstname').isEmail(),
    body('password', 'Please enter password').isLength({ min: 1 })
  ] ,
   
  async (req, res)=>{
    // #swagger.tags = ['Users']
    // #swagger.path = ['/api/auth/login']
    let success = false;
    try {
      
   
    const {email, password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({success, errors : errors.array()});
    }
    
    const userRec = await Auth.findByEmail(email);
    if(!userRec){
      return res.status(400).json({success, errors : "Try to login with correct credentials"});
    }
    const userInfo = userRec.userinfo;
    const passwordCompare = await bcrypt.compare(password, userInfo.password);

    if(!passwordCompare){
      return res.status(400).json({success, errors : "Try to login with correct credentials"});
    }

    
    
    //removing sensitive data from token
    delete userInfo.password;
    delete userInfo.email;
    let username = userInfo.firstname + ' ' + userInfo.lastname;
    let userrole = userInfo.userrole;
    let companyname = userInfo.companyname;
    let logourl = userInfo.logourl;
    let sidebarbgurl = userInfo.sidebarbgurl;
    let tenantcode = userInfo.tenantcode;
    delete userInfo.firstname;
    delete userInfo.lastname;
    userInfo.username = username;
// added by yamini 08-02-2024
    const refreshToken = jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '20m' });
    console.log('===>> refreshToken', refreshToken);

    // Include refresh token in the userInfo object
    userInfo.refreshToken = refreshToken;
    
// Added by yamini 25-01-2024
    console.log('===>> userInfo' , userInfo)

    const newRefreshToken = jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET);

    // Include refresh token in the userInfo object
    userInfo.newRefreshToken = newRefreshToken;
    delete userInfo.refreshToken
    
    console.log('===>> userInfo2' , userInfo)
    const authToken = jwt.sign(userInfo, process.env.JWT_SECRET, { expiresIn: '365d' });
    console.log('===>> authToken', authToken)
    success = true;
    //const permissions = userInfo.permissions;
 
    return res.status(201).json({ success, authToken, refreshToken })
    // return res.status(201).json({success, authToken});

  } catch (error) {
    console.log(error);
    res.status(400).json({success, errors : error});
  }
   // contacts.create(req, res);

  });

  router.post("/refresh-token", async (req, res) => {
    console.log('req.body.refreshToken', req.body.refreshToken);
    const refreshToken = req.body.refreshToken;
    console.log('refresh-token== ', refreshToken);
  
    if (!refreshToken) {
      return res.status(401).json({ success: false, errors: "Refresh token is required" });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      console.log('decoded', decoded);
      
	delete decoded.exp;

      // Generate a new access token
      const newAccessToken = jwt.sign(decoded, process.env.JWT_SECRET, { expiresIn: '15m' });
      console.log('refresh-token== newAccessToken', newAccessToken);
  
      // Generate a new refresh token
      const newRefreshToken = jwt.sign(decoded, process.env.REFRESH_TOKEN_SECRET);
      console.log('refresh-token== newRefreshToken', newRefreshToken);
  
      return res.json({ success: true, authToken: newAccessToken, refreshToken: newRefreshToken });
  
    } catch (error) {
      console.log(error);
      res.status(401).json({ success: false, errors: "Invalid refresh token" });
    }
  });
  

  router.put("/updatepassword", fetchUser, async (req, res) => {
    try {
      //Check permissions
      // #swagger.tags = ['Users']
      // #swagger.path = ['/api/auth/updatepassword']
      const { password } = req.body;
      const errors = [];
      const userRec = {};
      const salt = bcrypt.genSaltSync(10);
      const secPass = bcrypt.hashSync(req.body.password, salt);
      if (req.body.hasOwnProperty("password")) {
        userRec.password = secPass;
      }
      //if(req.body.hasOwnProperty("id")){userRec.id = id};

      if (errors.length !== 0) {
        return res.status(400).json({ errors: errors });
      }

      let resultUser = await Auth.findById(req.userinfo.id);

      if (resultUser) {
        resultLead = await Auth.updateById(req.userinfo.id, userRec);
        if (resultLead) {
          return res
            .status(200)
            .json({ success: true, message: "Record updated successfully" });
        }
        // return res.status(200).json(resultLead);
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

  // Get user by Id
  router.get(
    "/users/:id",
    fetchUser,

    async (req, res) => {
      // #swagger.tags = ['Users']
      // #swagger.path = ['/api/auth/users/:id']
      try {
        console.log("==========Single===============", req.userinfo);

        const userRec = await Auth.findById(req.params.id);

        if (!userRec) {
          return res.status(400).json({ errors: "User not found" });
        }

        return res.status(201).json(userRec);
      } catch (error) {
        res.status(400).json({ errors: error });
      }
      // contacts.create(req, res);
    }
  );

  // Update profile

  router.put("/:id/profile", fetchUser, async (req, res) => {
    console.log('req.file.id', req.params.id);
    const MIMEType = new Map([
      ["text/csv", "csv"],
      ["application/msword", "doc"],
      ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
      ["image/gif", "gif"],
      ["text/html", "html"],
      ["image/jpeg", "jpg"],
      ["image/jpg", "jpg"],
      ["application/json", "json"],
      ["audio/mpeg", "mp3"],
      ["video/mp4", "mp4"],
      ["image/png", "png"],
      ["application/pdf", "pdf"],
      ["application/vnd.ms-powerpoint", "ppt"],
      ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
      ["image/svg+xml", "svg"],
      ["text/plain", "txt"],
      ["application/vnd.ms-excel", "xls"],
      ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
      ["text/xm", "xml"],
      ["application/xml", "xml"],
      ["application/atom+xml", "xml"],
      ["application/zip", "zip"],
    ]);
    File.init(req.userinfo.tenantcode);

    const resultFile = await File.findByParentId(req.params.id);
    console.log('resultFile', resultFile);

    if (resultFile) {
      console.log('resultFile', resultFile);
      for (const value of resultFile) {
        const fileId = value.id;
        const fileTitle = value.title;
        const fileType = value.filetype;
        const parentId = value.parentid;
        const filePath = `${process.env.PROJECT_3D_FILE_PATH}${req.userinfo.tenantcode}/users/${parentId}.${fileType}`;
        console.log('filePath ====> ', filePath);

        if (fs.existsSync(filePath)) {
          console.log('delete call');
          const result = await File.deleteFile(fileId);
          console.log('result', result);
          if (!result) {
            return res.status(200).json({ "success": false, "message": "No record found" });
          } else {
            fs.unlinkSync(filePath);
            console.log('if call', req.files.file);
            const pdfreference = req.files.file;
            console.log('pdfreference:', pdfreference, req.body.staffRecord);
            const newVersiorecord = JSON.parse(JSON.parse(req.body.staffRecord));
            console.log('newVersiorecord:', newVersiorecord);
            delete newVersiorecord.managername;
            const resultObj = await Auth.findById(req.userinfo.id);
            console.log('resultObj:', resultObj);

            if (resultObj) {
              const result = await Auth.updateRecById(resultObj.id, newVersiorecord, req.userinfo.id);
              console.log('result:', result);
              if (!result) {
                return res.status(400).json({ errors: "Bad Request" });
              }

              const newReq = {
                "title": pdfreference.name,
                "filetype": MIMEType.get(pdfreference.mimetype) || pdfreference.mimetype,
                "parentid": resultObj.id,
                "filesize": pdfreference.size
              };

              const fileRec = await File.create(newReq, req.userinfo.id);
              const uploadPath = `${process.env.PROJECT_3D_FILE_PATH}${req.userinfo.tenantcode}/users`;
              
              const filePath = `${uploadPath}/${fileRec.parentid}.${fileRec.filetype}`;
              console.log('filePath:', filePath);

              try {
                if (fs.existsSync(uploadPath)) {
                  pdfreference.mv(filePath, (err) => {
                    if (err) {
                      return res.send(err);
                    }
                  });
                } else {
                  fs.mkdirSync(uploadPath,{ recursive: true });
                  pdfreference.mv(filePath, (err) => {
                    if (err) {
                      return res.send(err);
                    }
                  });
                }
              } catch (e) {
                console.log("An error occurred.", e);
              }

              return res.status(201).json(result);
            }
            return res.status(200).json({ "success": true, "message": "Successfully Deleted" });
          }
        }
      }
    }

    const pdfreference = req?.files?.file;
    console.log('pdfreference:', pdfreference, req.body.staffRecord);
    const newVersiorecord = JSON.parse(JSON.parse(req.body.staffRecord));
    delete newVersiorecord.managername;
    console.log('newVersiorecord:', newVersiorecord);
    const resultObj = await Auth.findById(req.userinfo.id);
    console.log('resultObj:', resultObj);

    if (resultObj) {
      const result = await Auth.updateRecById(resultObj.id, newVersiorecord, req.userinfo.id);
      console.log('result:', result);
      if (!result) {
        return res.status(400).json({ errors: "Bad Request" });
      }
      if (pdfreference) {
        const newReq = {
          "title": pdfreference.name,
          "filetype": MIMEType.get(pdfreference.mimetype) || pdfreference.mimetype,
          "parentid": resultObj.id,
          "filesize": pdfreference.size
        };

        const fileRec = await File.create(newReq, req.userinfo.id);
        const uploadPath = `${process.env.PROJECT_3D_FILE_PATH}${req.userinfo.tenantcode}/users`;

        const filePath = `${uploadPath}/${fileRec.parentid}.${MIMEType.get(pdfreference.mimetype) || pdfreference.mimetype}`;

        console.log('filePath:', filePath);

        try {
          if (fs.existsSync(uploadPath)) {
            pdfreference.mv(filePath, (err) => {
              if (err) {
                return res.send(err);
              }
            });
          } else {
            fs.mkdirSync(uploadPath,{ recursive: true });
            pdfreference.mv(filePath, (err) => {
              if (err) {
                return res.send(err);
              }
            });
          }
        } catch (e) {
          console.log("An error occurred.", e);
        }
        return res.status(201).json(result);
      }
    }
  });
  //......................................Delete Myimage.................................

  router.delete("/myimage", fetchUser, async (req, res) => {
    try {
      File.init(req.userinfo.tenantcode);

      // Assuming parentid is part of the request body
      console.log("req.userinfo", req.userinfo);
      const parentId = req.userinfo.id;

      if (!parentId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Missing parentid in the request body",
          });
      }

      const resultFile = await File.findByParentId(parentId);

      if (!resultFile || resultFile.length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "No files found for the given parentid",
          });
      }

      for (const value of resultFile) {
        const fileId = value.id;
        const fileType = value.filetype;
        const parentId = value.parentid;
        const filePath = `${process.env.PROJECT_3D_FILE_PATH}${req.userinfo.tenantcode}/users/${parentId}.${fileType}`;

        if (fs.existsSync(filePath)) {
          const result = await File.deleteFile(fileId);

          if (!result) {
            return res
              .status(400)
              .json({
                success: false,
                message: "Failed to delete file record",
              });
          }

          fs.unlinkSync(filePath);
        }
      }

      return res
        .status(200)
        .json({ success: true, message: "Files deleted successfully" });
    } catch (error) {
      console.error("error:", error);
      res.status(500).json({ success: false, errors: error.message });
    }
  });

  //......................................Update User.................................
  router.put("/:id", fetchUser, async (req, res) => {
    try {
      //Check permissions

      // #swagger.tags = ['Users']
      // #swagger.path = ['/api/auth/:id']
      const {
        firstname,
        lastname,
        email,
        joiningdate,
        leavingdate,
        phone,
        userrole,
        password,
        isactive,
        managerid,
      } = req.body;
      const errors = [];
      const userRec = {};

      //console.log("fnm", req.body.hasOwnProperty("salutation"));
      if (req.body.hasOwnProperty("firstname")) {
        userRec.firstname = firstname;
        if (!firstname) {
          errors.push("Firstname is required");
        }
      }
      if (req.body.hasOwnProperty("lastname")) {
        userRec.lastname = lastname;
        if (!lastname) {
          errors.push("Lastname is required");
        }
      }
      if (req.body.hasOwnProperty("email")) {
        userRec.email = email;
        if (!email) {
          errors.push("Email is required");
        }
      }
      if (req.body.hasOwnProperty("password")) {
        userRec.password = password;
        if (!password) {
          errors.push("Password is required");
        }
      }
      if (req.body.hasOwnProperty("phone")) {
        userRec.phone = phone;
      }

      if (req.body.hasOwnProperty("userrole")) {
        userRec.userrole = userrole;
      }
      if (req.body.hasOwnProperty("isactive")) {
        userRec.isactive = isactive;
      }
      if (req.body.hasOwnProperty("managerid")) {
        userRec.managerid = managerid;
      }
      if (req.body.hasOwnProperty("joiningdate")) {
        userRec.joiningdate = joiningdate;
      }
      if (req.body.hasOwnProperty("leavingdate")) {
        userRec.leavingdate = leavingdate;
      }

      if (errors.length !== 0) {
        return res.status(400).json({ errors: errors });
      }

      let resultUser = await Auth.findById(req.params.id);

      if (
        resultUser.userrole === "SUPER_ADMIN" &&
        req.params.id !== req.userinfo.id
      ) {
        return res.status(400).json({ errors: "You cannot edit system admin" });
      }

      if (resultUser) {
        if (req.body.hasOwnProperty("isactive") && isactive === true) {
          // const allowedLicenses = await Auth.checkLicenses(req.userinfo.companyid, resultUser.id);
          // if(!allowedLicenses){
          //   return res.status(400).json({errors : "Licenses limit exceeded"});
          // }
        } else if (
          req.body.hasOwnProperty("isactive") &&
          isactive === false &&
          req.params.id === req.userinfo.id
        ) {
          return res
            .status(400)
            .json({ errors: "You cannot deactivate yourself" });
        }
        //console.log('req.userinfo:', req.userinfo);
        if (req.body.hasOwnProperty("password")) {
          const salt = bcrypt.genSaltSync(10);
          const secPass = bcrypt.hashSync(req.body.password, salt);
          userRec.password = secPass;
        }

        resultUser = await Auth.updateRecById(
          req.params.id,
          userRec,
          req.userinfo.id
        );
        if (resultUser) {
          if (resultUser.isError)
            return res
              .status(400)
              .json({ success: false, errors: resultUser.errors });
          else
            return res
              .status(200)
              .json({ success: true, message: "Record updated successfully" });
        }
        return res.status(200).json(resultUser);
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

  // Create a new Tutorial
  router.get(
    "/getuser",
    fetchUser,

    async (req, res) => {
      try {
        const userid = req.userinfo.id;
        const userRec = await Auth.findById(userid);

        if (!userRec) {
          return res.status(400).json({ errors: "User not found" });
        }

        return res.status(201).json(userRec);
      } catch (error) {
        res.status(400).json({ errors: error });
      }
      // contacts.create(req, res);
    }
  );

  // Fetch all Users
  router.get(
    "/active-users",
    fetchUser,

    async (req, res) => {
      // #swagger.tags = ['Users']
      // #swagger.path = ['/api/auth/users']
      try {
        const userRec = await Auth.findActiveUsers(req.userinfo.companyid);
        if (!userRec) {
          return res.status(400).json({ errors: "User not found" });
        }
        return res.status(201).json(userRec);
      } catch (error) {
        res.status(400).json({ errors: error });
      }
      // contacts.create(req, res);
    }
  );

  // Fetch all Users
  router.get(
    "/users",
    fetchUser,

    async (req, res) => {
      // #swagger.tags = ['Users']
      // #swagger.path = ['/api/auth/users']
      try {
        const userRec = await Auth.findAll(req.userinfo.companyid);
        if (!userRec) {
          return res.status(400).json({ errors: "User not found" });
        }
        return res.status(201).json(userRec);
      } catch (error) {
        res.status(400).json({ errors: error });
      }
      // contacts.create(req, res);
    }
  );

  // ................................................Download file .......................................
  router.get("/myimage", fetchUser, async (req, res) => {
    try {
        console.log('fetching my image');
        File.init(req.userinfo.tenantcode);
        const resultFile = await File.findByParentId(req.userinfo.id);
        console.log('resultFile', resultFile);
        if(resultFile){
        //const filePath = "D:/Files/" + parentId +"/"+ fileId + '.' + fileType;
  
          let filePath = process.env.PROJECT_3D_FILE_PATH + req.userinfo.tenantcode + "/users/" + req.userinfo.id + "." + resultFile[0].filetype ;
          console.log('fetching my filePath ', filePath);
          res.download(filePath, "myprofileimage",function(err) {
          
            if(err) {
              return res.status(400).json({ "Error": false, "message": err });
            }
          });
          console.log('Your file has been downloaded!')
  
        }else{
          return res.status(400).json({ "Error": false, "message": err });
        } 
      }catch (error) {
        console.log('System Error:', error);
        return res.status(400).json({ "Error": false, "message": error });
      }
      
  });
  // ................................................Download file .......................................
  router.get("/myimage/:id", async (req, res) => {
    try {
      console.log("fetching my image");
      let tenantCode = "ibs_sthapatya"; 
      File.init(tenantCode);
      const resultFile = await File.findByParentId(req.params.id);
      console.log("resultFile", resultFile);
      if (resultFile) {
        //const filePath = "D:/Files/" + parentId +"/"+ fileId + '.' + fileType;

        let filePath =
          process.env.PROJECT_3D_FILE_PATH +
          tenantCode+
          "/users/" +
          req.params.id +
          "." +
          resultFile[0].filetype;
        console.log("fetching my filePath ", filePath);
        res.download(filePath, "myprofileimage", function (err) {
          if (err) {
            return res.status(400).json({ Error: false, message: err });
          }
        });
        console.log("Your file has been downloaded!");
      } else {
        return res.status(400).json({ Error: false, message: err });
      }
    } catch (error) {
      console.log("System Error:", error);
      return res.status(400).json({ Error: false, message: error });
    }
  });

  // ................................................Download file .......................................
  router.get("/userimage/:id", async (req, res) => {
    try {
      //const filePath = "D:/Files/" + parentId +"/"+ fileId + '.' + fileType;
      let tenantCode = "ibs_sthapatya"; 
      File.init(tenantCode);
      const resultFile = await File.findByParentId(req.params.id);
   
      console.log("resultFile", resultFile);
      if (resultFile) {
        let filePath =
        process.env.PROJECT_3D_FILE_PATH +
        tenantCode+
        "/users/" +
        req.params.id +
        "." +
        resultFile[0].filetype;
      res.download(filePath, req.params.id, function (err) {
        console.log("err:", err);
        if (err) {
          return res.status(400).json({ Error: false, message: err });
        }
      });}
    } catch (error) {
      console.log("System Error:", error);
      return res.status(400).json({ Error: false, message: error });
    }
  });

  // Get user by Id
  router.get(
    "/managers",
    fetchUser,

    async (req, res) => {
      // #swagger.tags = ['Users']
      // #swagger.path = ['/api/auth/managers']
      try {
        console.log("====manager====");
        const userRecList = await Auth.getAllManager();
        console.log(userRecList);
        if (!userRecList) {
          return res.status(400).json({ errors: "User not found" });
        }

        return res.status(201).json(userRecList);
      } catch (error) {
        res.status(400).json({ errors: error });
      }
    }
  );

  app.use(process.env.BASE_API_URL + "/api/auth", router);
};
