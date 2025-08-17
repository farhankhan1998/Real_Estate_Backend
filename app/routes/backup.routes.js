/**
 * Handles all incoming request for /api/files endpoint
 * DB table for this public.file
 * Model used here is file.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/files/:pid/*
 *              GET     /api/files/:id
 *              POST    /api/files/:pid
 *              PUT     /api/files/:id
 *              DELETE  /api/files/:id
 * 
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */


const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Backup = require("../models/backup.model.js");
const path = require('path');
const fs = require('fs');




module.exports = app => {


  const { body, validationResult } = require('express-validator');

  var router = require("express").Router();
  var newReq = {};



  // .......................................... get all file......................................
  router.post("/",  fetchUser, async (req, res) => {
    
    let result = Backup.backup('public');
    return res.status(200).json(result);

  });

  // .......................................... get all file......................................
  router.get("/",  fetchUser, async (req, res) => {
    const response = [];
    //let result = Backup.backup(req.userinfo.tenantcode);
    if(fs.existsSync(`/home/files/backup/public`)){
      const files = fs.readdirSync(`/home/files/backup/public`, 'utf8');
      
      for (let file of files) {
        const extension = path.extname(file);
        const fileStats = fs.statSync(`/home/files/backup/public/` + file);
        console.log(fileStats)
        response.push({ name: file, extension, fileStats });
      }
    
    
        
            
    }
    return res.status(200).json(response);
     

    
    });


    // ................................................Download file .......................................
router.get("/download/:filename", fetchUser, async (req, res) => {
  try {
    console.log('### download')
    
  
    const filename     = req.params.filename;

    //const filePath = "D:/Files/" + parentId +"/"+ fileId + '.' + fileType;
    let filePath = `/home/files/backup/public/${filename}`;
    console.log('filePath:', filePath);
    res.attachment(filename);
    res.download(filePath, filename,function(err) {
      console.log('err:', err);
      if(err) {
        return res.status(400).json({ "Error": false, "message": err });

      }
      //return res.status(200).json({ success : true, "message" : "File downloaded successfully" });
    });
  } catch (error) {
    console.log('System Error:', error);
    return res.status(400).json({ "Error": false, "message": error });
  }

  //return res.status(200).json({ success : true, "message" : "File downloaded successfully" });
});

  // ................................................Download file .......................................
  router.get("/delete/:filename", fetchUser, async (req, res) => {
    try {
      console.log('### delete')
      
    
      const filename     = req.params.filename;
  
      //const filePath = "D:/Files/" + parentId +"/"+ fileId + '.' + fileType;
      let filePath = `/home/files/backup/public/${filename}`;
      if (fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
      }
      
    } catch (error) {
      console.log('System Error:', error);
      return res.status(400).json({ "Error": false, "message": error });
    }

    return res.status(200).json({ success : true, "message" : "File deleted successfully" });
  });
  

  // Delete all Tutorials
  //router.delete("/", files.deleteAll);
  app.use(process.env.BASE_API_URL + '/api/backup', router);
};