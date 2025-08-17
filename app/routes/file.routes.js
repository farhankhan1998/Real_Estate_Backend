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
const File = require("../models/file.model.js");
const path = require("path");
const fs = require("fs");
const Property = require("../models/property.model.js");

// const moment = require("moment");

module.exports = (app) => {
  const { body, validationResult } = require("express-validator");

  var router = require("express").Router();
  var newReq = {};

  // ................................create......................................

  router.post("/:id", fetchUser, [], async (req, res) => {
    console.log("req.files", req.files);
    const MIMEType = new Map([
      ["text/csv", "csv"],
      ["application/msword", "doc"],
      [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "docx",
      ],
      ["image/gif", "gif"],
      ["text/html", "html"],
      ["image/jpeg", "jpeg"],
      ["image/jpg", "jpg"],
      ["application/json", "json"],
      ["audio/mpeg", "mp3"],
      ["video/mp4", "mp4"],
      ["image/png", "png"],
      ["application/pdf", "pdf"],
      ["application/vnd.ms-powerpoint", "ppt"],
      [
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "pptx",
      ],
      ["image/svg+xml", "svg"],
      ["text/plain", "txt"],
      ["application/vnd.ms-excel", "xls"],
      [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "xlsx",
      ],
      ["text/xm", "xml"],
      ["application/xml", "xml"],
      ["application/atom+xml", "xml"],
      ["application/zip", "zip"],
    ]);

    let times = 0;
    const arry = [];
    let selectedType = req.body?.fileType ? req.body?.fileType : null;
    console.log("selectedType", selectedType);
    if (!req.files) {
      return res.status(400).json({ errors: "No File selected" });
    }
    for (const f in req.files) {
      const fileDetail = req.files[f];
      //console.log('fileDetail',fileDetail)
      newReq = {
        title: (fileDetail.name).toLowerCase(),
        filetype: (MIMEType.has(fileDetail.mimetype)
          ? MIMEType.get(fileDetail.mimetype)
          : fileDetail.name.split(".").pop()).toLowerCase(),
        parentid: req.params.id,
        filesize: fileDetail.size,
        documenttype: req.body.fileType,
        // "createddate": moment().format("YYYY-MM-DD"),
        // "createdbyid": req.params.id,
        description: req.body.description,
        sectionintemplate: req.body.sectionintemplate,
        ispdf: req.body.ispdf,
      };
      console.log("newReq", newReq);

      if (newReq.title.includes("jpg")) {
        newReq.filetype = "jpg";
      } else {
        // console.log('The title does not contain "jpg"');
      }

      File.init(req.userinfo.tenantcode);
      const fileRec = await File.create(newReq, req.userinfo.id);

      if (selectedType && selectedType === "project_3d_plan") {
        project.init(req.userinfo.tenantcode);
        let resultProject = await project.findById(req.params.id);
        if (resultProject && resultProject.file3d) {
          let pieces = resultProject.file3d.split("/");
          const last = pieces[pieces.length - 1].split(".")[0];
          //console.log('last',last)
          File.init(req.userinfo.tenantcode);
          let resultFile = await File.findById(last);
          if (resultFile && resultFile.id) {
            const result = File.deleteFile(resultFile.id);
            let deleteFile =
              process.env.PROJECT_3D_FILE_PATH +
              req.userinfo.tenantcode +
              "/" +
              req.params.id +
              "/" +
              last +
              "." +
              resultFile.title.split(".").pop();
            //console.log('deleteFile',deleteFile)
            if (fs.existsSync(deleteFile)) {
              //const result = File.deleteFile(req.params.id);
              if (!result) {
              } else {
                fs.unlinkSync(deleteFile);
              }
            }
          }
        }

        project.init(req.userinfo.tenantcode);
        let projectRec = {
          file3d: `${process.env.PROJECT_3D_FILE_PATH}${
            req.userinfo.tenantcode
          }/${fileRec.parentid}/${fileRec.id}.${fileRec.title
            .split(".")
            .pop()}`,
        };
        console.log("projectRec", projectRec);
        resultProject = await project.updateById(
          req.params.id,
          projectRec,
          req.userinfo.id
        );
      }
      console.log("fileRec", fileRec);
      arry.push(fileRec);
      if (!fileRec) {
        return res.status(400).json({ errors: "Bad Request" });
      }
      let uploadPath = "";
      console.log("selectedType", selectedType);
      if (
        selectedType &&
        (selectedType === "project_image" ||
          selectedType === "project_plan" ||
          selectedType === "project_3d_plan")
        //  ||
        // selectedType === "property_image"
      ) {
        uploadPath =
          process.env.PROJECT_3D_FILE_PATH +
          req.userinfo.tenantcode +
          "/" +
          req.params.id;
      } else {
        uploadPath =
          process.env.FILE_UPLOAD_PATH +
          req.userinfo.tenantcode +
          "/" +
          req.params.id;
      }
      let filePath =
        uploadPath + "/" + fileRec.id + "." + (fileDetail.name.split(".").pop()).toLowerCase();
      console.log("filePath", filePath);
      console.log("uploadPath", uploadPath);
      let filePathUpdate = { filepath: filePath };
      let updateResult = File.updateById(fileRec.id, filePathUpdate);
      try {
        if (fs.existsSync(uploadPath)) {
          fileDetail.mv(filePath, (err) => {
            if (err) {
              return res.send(err);
            }
          });
        } else {
          if (times === 0) {
            fs.mkdirSync(uploadPath, { recursive: true });
            times++;
          }
          fileDetail.mv(filePath, (err) => {
            if (err) {
              return res.send(err);
            }
          });
        }
      } catch (e) {
        console.log("An error occurred.", e);
      }
    }

    return res.status(201).json(arry);
  });

  // .......................................get ispdf = true records by parentID.....................................

  router.get("/lead-email/", fetchUser, async (req, res) => {
    try {
      Property.init(req.userinfo.tenantcode);
      File.init(req.userinfo.tenantcode);

      const result = await File.findAllWithPdf();
      console.log("result *==>", result);
      if (result) {
        return res.status(200).json(result);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No records found" });
      }
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  });

  // .......................................get all related file by parentID.....................................
  router.get("/generated-pdf/:id/all", fetchUser, async (req, res) => {
    try {
      File.init(req.userinfo.tenantcode);
      let resultFile = await File.findByParentId(req.params.id, true);
      console.log("resultFile--> ", resultFile);
      if (resultFile) {
        return res.status(200).json(resultFile);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {}
  });
  // .......................................get all related file by parentID.....................................
  router.get("/:id/all", fetchUser, async (req, res) => {
    try {
      File.init(req.userinfo.tenantcode);
      let resultFile = await File.findByParentId(req.params.id);
      console.log("resultFile--> ", resultFile);
      if (resultFile) {
        return res.status(200).json(resultFile);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {}
  });

  // // .......................................get all related file by parentID.....................................
  // router.get("/:id/all", fetchUser, async (req, res) => {
  //   try {
  //     File.init(req.userinfo.tenantcode);
  //     let resultFile = await File.findByParentId(req.params.id);
  //     console.log('resultFile--> ',resultFile)
  //     if (resultFile) {
  //       return res.status(200).json(resultFile);
  //     } else {
  //       return res.status(200).json({ "success": false, "message": "No record found" });
  //     }
  //   } catch (error) {

  //   }
  // });

  // .......................................get all related file by parentID.....................................
  router.get(
    "/:id/projects/plan/:documenttype",
    fetchUser,
    async (req, res) => {
      try {
        console.log("()()()())");
        File.init(req.userinfo.tenantcode);
        console.log("resultpicpro", req.params.id);
        let resultFile = await File.findByParentpic(
          req.params.id,
          req.params.documenttype
        );
        //console.log('resultFile-->id/pic/pro ',resultFile)
        if (resultFile) {
          return res.status(200).json(resultFile);
        } else {
          return res
            .status(200)
            .json({ success: false, message: "No record found" });
        }
      } catch (error) {}
    }
  );

  // ................................................get file by Id.......................................
  router.get("/:id", fetchUser, async (req, res) => {
    try {
      File.init(req.userinfo.tenantcode);
      let resultFile = await File.findById(req.params.id);
      if (resultFile) {
        return res.status(200).json(resultFile);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      //console.log('System Error:', error);
      return res.status(400).json({ success: false, message: error });
    }
  });

  // ................................................Download file .......................................
  router.get("/:id/download", async (req, res) => {
    try {
      //console.log('### download')
      let tenantCode = "ibs_sthapatya"; // statically assigning ibs_sthapahya as tenant code since we have only one tenant
      File.init(tenantCode);
      let fileRec = await File.findById(req.params.id);
      if (!fileRec) {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
      const fileId = req.params.id;
      const fileTitle = fileRec.title;
      const fileType = fileRec.filetype;
      const parentId = fileRec.parentid;
      //const filePath = "D:/Files/" + parentId +"/"+ fileId + '.' + fileType;
      let filePath =
        process.env.FILE_UPLOAD_PATH +
        tenantCode +
        "/" +
        parentId +
        "/" +
        fileId;
      console.log("filePath:", filePath);
      res.attachment(fileTitle + "." + fileType);
      res.download(filePath + "." + fileType, fileTitle, function (err) {
        ////console.log('err:', err);
        if (err) {
          return res.status(400).json({ Error: false, message: err });
        }
      });
    } catch (error) {
      console.log("System Error:", error);
      return res.status(400).json({ Error: false, message: error });
    }
  });

  // ................................................Download file .......................................
  router.get("/:id/3dfile/download", fetchUser, async (req, res) => {
    try {
      console.log("### download", req.params.id);
      File.init(req.userinfo.tenantcode);
      let fileRec = await File.findById(req.params.id);
      if (!fileRec) {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
      const fileId = req.params.id;
      const fileTitle = fileRec.title;
      const fileType = fileRec.filetype;
      const parentId = fileRec.parentid;
      //const filePath = "D:/Files/" + parentId +"/"+ fileId + '.' + fileType;
      let filePath =
        process.env.PROJECT_3D_FILE_PATH +
        req.userinfo.tenantcode +
        "/" +
        parentId +
        "/" +
        fileId;
      //console.log('filePath:', filePath);
      res.attachment(fileTitle + "." + fileType);
      res.download(filePath + "." + fileType, fileTitle, function (err) {
        ////console.log('err:', err);
        if (err) {
          return res.status(400).json({ Error: false, message: err });
        }
      });
    } catch (error) {
      console.log("System Error:", error);
      return res.status(400).json({ Error: false, message: error });
    }
  });

  // ................................update file........................................................
  router.put("/:id", fetchUser, async (req, res) => {
    try {
      const {
        title,
        filetype,
        filesize,
        description,
        sectionintemplate,
        ispdf,
        documenttype
      } = req.body;
      const errors = [];
      const fileRec = {};

      if (req.body.hasOwnProperty("title")) {
        fileRec.title = title;
      }
      if (req.body.hasOwnProperty("description")) {
        fileRec.description = description;
      }
      if (req.body.hasOwnProperty("sectionintemplate")) {
        fileRec.sectionintemplate = sectionintemplate;
      }
      if (req.body.hasOwnProperty("ispdf")) {
        fileRec.ispdf = ispdf;
      }
      if (req.body.hasOwnProperty("documenttype")) {
        fileRec.documenttype = documenttype;
      }

      if (errors.length !== 0) {
        return res.status(400).json({ errors: errors });
      }

      File.init(req.userinfo.tenantcode);
      let resultFile = await File.findById(req.params.id);

      if (resultFile) {
        resultFile = await File.updateById(req.params.id, fileRec);
        if (resultFile) {
          return res
            .status(200)
            .json({ success: true, message: "Record updated successfully" });
        }
        return res.status(200).json(resultFile);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      res.status(400).json({ errors: error });
    }
  });

  // .......................................... get all file......................................
  router.get("/", fetchUser, async (req, res) => {
    File.init(req.userinfo.tenantcode);
    const files = await File.findAll();
    if (files) {
      res.status(200).json(files);
    } else {
      res.status(400).json({ errors: "No data" });
    }
  });

  // ..................................................delete file by id......................................
  router.delete("/:id", fetchUser, async (req, res) => {
    File.init(req.userinfo.tenantcode);
    let resultFile = await File.findById(req.params.id);
    console.log("resultFile *==>", resultFile);
    if (resultFile) {
      const MIMEType = new Map([
        ["text/csv", "csv"],
        ["application/msword", "doc"],
        [
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "docx",
        ],
        ["image/gif", "gif"],
        ["text/html", "html"],
        ["image/jpeg", "jpeg"],
        ["image/jpeg", "jpg"],
        ["application/json", "json"],
        ["audio/mpeg", "mp3"],
        ["video/mp4", "mp4"],
        ["image/png", "png"],
        ["application/pdf", "pdf"],
        ["application/vnd.ms-powerpoint", "ppt"],
        [
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "pptx",
        ],
        ["image/svg+xml", "svg"],
        ["text/plain", "txt"],
        ["application/vnd.ms-excel", "xls"],
        [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "xlsx",
        ],
        ["text/xm", "xml"],
        ["application/xml", "xml"],
        ["application/atom+xml", "xml"],
        ["application/zip", "zip"],
      ]);
      console.log("MIMEType *==>", MIMEType);
      //let uploadPath = './app/upload/' + resultFile.parentid;

      //console.log('delete');
      let fileRec = await File.findById(req.params.id);
      if (!fileRec) {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
      const fileId = req.params.id;
      const fileTitle = fileRec.title;
      const fileType = fileRec.filetype;
      const parentId = fileRec.parentid;
      const documenttype = fileRec.documenttype;

      let filePath = "";
      if (
        documenttype &&
        (documenttype === "project_image" ||
          documenttype === "project_plan" ||
          documenttype === "project_3d_plan" ||
          documenttype === "property_image")
      ) {
        filePath =
          process.env.PROJECT_3D_FILE_PATH +
          req.userinfo.tenantcode +
          "/" +
          parentId +
          "/" +
          fileId;
      } else {
        filePath =
          process.env.FILE_UPLOAD_PATH +
          req.userinfo.tenantcode +
          "/" +
          parentId +
          "/" +
          fileId;
      }

      let extension = MIMEType.has(resultFile.filetype)
        ? MIMEType.get(resultFile.filetype)
        : resultFile.filetype;
      filePath += "." + extension;

      //console.log('filePath:', filePath);
      const result = await File.deleteFile(req.params.id);
      if (fs.existsSync(filePath)) {
        //const result = File.deleteFile(req.params.id);
        if (!result) {
          return res
            .status(200)
            .json({ success: false, message: "No record found" });
        } else {
          fs.unlinkSync(filePath);
          return res
            .status(200)
            .json({ success: true, message: "Successfully Deleted" });
        }
      }
    }
    return res.status(400).json({ success: false, message: "No Record Found" });
  });

  // Delete all Tutorials
  //router.delete("/", files.deleteAll);
  app.use(process.env.BASE_API_URL + "/api/files", router);
};
