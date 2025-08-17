/**
 * Handles all incoming request for /api/leads endpoint
 * DB table for this public.lead
 * Model used here is lead.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/leads
 *              GET     /api/leads/:id
 *              POST    /api/leads
 *              PUT     /api/leads/:id
 *              DELETE  /api/leads/:id
 *
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express")
const { fetchUser } = require("../middleware/fetchuser.js")
const Lead = require("../models/lead.model.js")
const Auth = require("../models/auth.model.js")
const permissions = require("../constants/permissions.js")
const global = require("../constants/global.js")
const Mailer = require("../models/mail.model.js")
const Notification = require('../models/notification.model.js')

module.exports = (app) => {
  const { body, validationResult } = require("express-validator")

  var router = require("express").Router()

  // ..........................................Create lead..........................................
  router.post(
    "/",
    fetchUser,
    [
      // body("firstname", "Please enter firstname").isLength({ min: 1 }),
      // body("lastname", "Please enter lastname").isLength({ min: 1 }),
      // body("phone", "Please enter valid phone (10 digit)").isLength({
      //   min: 10,
      // }),
    ],

    async (req, res) => {
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.EDIT_LEAD ||
          el.name === permissions.MODIFY_ALL
      )
      if (!permission) return res.status(401).json({ errors: "Unauthorized" })

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      Lead.init(req.userinfo.tenantcode)
      const leadRec = await Lead.create(req.body, req.userinfo.id)

      console.log("leadRec:", leadRec)
      if (!leadRec) {
        return res.status(400).json({ errors: "Bad Request" })
      }

      res.status(201).json(leadRec)

      let newLead = await Lead.findById(leadRec.id)
      console.log("newLead:", newLead)
      if (newLead.owneremail) {
        let email = Lead.prepareMailForNewLead(newLead)
        let fromEmail = Object.keys(JSON.parse(process.env.FROM_EMAIL))[0]
        console.log('fromEmail :>> ', fromEmail);
        console.log("email:", email)
        // Mailer.sendLeadAlertEmail(fromEmail || 'emailtesting.Farhan Khanservices@gmail.com', email);
      }
      if(newLead.ownerid){
        console.log('ownerid is not null, calling create Notificatoin');
        Notification.createNotificationRecord('lead_create', newLead, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
        Notification.createNotificationRecord('lead_assign', newLead, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
      }

      //return res.status(201).json(leadRec);
    }
  )

  // // ..........................................Create lead from facebook..........................................
  // router.post("/fb", [], async (req, res) => {
  //   if (!req.body) res.status(400).json({ errors: "Bad Request" });

  //   try {
  //     Lead.init(req.userinfo.tenantcode);
  //     const leadRec = await Lead.createFB(req.body, global.SYSTEM_DEFAULT_USER);

  //     console.log("leadRec:", leadRec);
  //     if (!leadRec) {
  //       return res.status(400).json({ errors: "Bad Request" });
  //     }

  //     return res.status(201).json(leadRec);
  //   } catch (error) {
  //     console.log("===", JSON.stringify(error));
  //     return res.status(400).json({ errors: error });
  //   }
  // });

  // ......................................Get All lead........................................
  router.get("/", fetchUser, async (req, res) => {
    //Check permissions
    console.log("permissions.VIEW_LEAD:", permissions.VIEW_LEAD)
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.VIEW_LEAD ||
        el.name === permissions.MODIFY_ALL ||
        el.name === permissions.VIEW_ALL
    )
    if (!permission) return res.status(401).json({ errors: "Unauthorized" })
    Lead.init(req.userinfo.tenantcode)
    const leads = await Lead.findAll()
    //console.log('leads:', leads);
    if (leads) {
      res.status(200).json(leads)
    } else {
      res.status(400).json({ errors: "No data" })
    }
  })

  // .....................................Get Lead by Id........................................
  router.get("/:id", fetchUser, async (req, res) => {
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.VIEW_LEAD ||
          el.name === permissions.MODIFY_ALL ||
          el.name === permissions.VIEW_ALL
      )
      if (!permission) return res.status(401).json({ errors: "Unauthorized" })
      Lead.init(req.userinfo.tenantcode)
      let resultLead = await Lead.findById(req.params.id)
      if (resultLead) {
        return res.status(200).json(resultLead)
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" })
      }
    } catch (error) {
      console.log("System Error:", error)
      return res.status(400).json({ success: false, message: error })
    }
  })

  //......................................Get Lead by OwnerId.................................
  router.get("/:id/*", fetchUser, async (req, res) => {
    try {
      console.log("--------")
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.VIEW_LEAD ||
          el.name === permissions.MODIFY_ALL ||
          el.name === permissions.VIEW_ALL
      )
      if (!permission) return res.status(401).json({ errors: "Unauthorized" })
      Lead.init(req.userinfo.tenantcode)
      let resultLead = await Lead.findByOwnerId(req.params.id)
      if (resultLead) {
        return res.status(200).json(resultLead)
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" })
      }
    } catch (error) {
      console.log("System Error:", error)
      return res.status(400).json({ success: false, message: error })
    }
  })

  //.........................................Update lead .....................................
  router.put("/:id", fetchUser, async (req, res) => {
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.EDIT_LEAD ||
          el.name === permissions.MODIFY_ALL
      )
      if (!permission) return res.status(401).json({ errors: "Unauthorized" })

      const {
        firstname, lastname,  salutation, designation, email, phone, alternatephone,
        clientstreet, clientcity, clientstate, clientcountry, clientpincode, clientcalloption, clientcalloptionemail, 
        clientcalloptionname, clientcalloptionmobile, clientcalloptiondate, clientcalloptionremark, clientcalloptionratepersqfeet, 
        clientcalloptionbrokerage, transactiontype, typeofclient, vertical, verticaltype, subverticaltype, zone, type, otherlocations, otherdetails, 
        areaorlocationbrief, completiondate,  ownerid, leadsource,leadstage, company, noofdocksvalue,
        noofwashroomsvalue,openareaunit,openareavalue,  closeareaunit,  closeareavalue,rentalunit, rentalvalue,clienttype,
        retailsubvertical, typeofwarehouse, floor, chargeablearea, offeredcarpetarea, heightside, heightcenter, typeofflooring, 
        firehydrants, firesprinkelers, firenoc, quotedrentonchargeablearea, securitydeposit, commonareamaintaince, possessionstatus, 
        addtionalinformation, project, location, totalfloors, totalbuilduparea, offeredspacedetails, flooroffered, quotedrent, maintainancecharges,
         powerbackup, powerallocation, powerbackupsystem, powerbackupcharges, othergeneralterms, proposedleaseterm, proposedlockperiod, rentescalation, 
         intrestfreesecuritydeposit, propertytax, stampdutyregistrationcharges, parkingcharges, availability, marketbrand, googlecoordinates, offeredarea, 
         frontagearea, commercialterms, heightfloor, remark, verticalname, floorplatesize, chargeableareaoffered, workinghours, status, fitoutrental,
          propertystatus, electriccharges, numberofcarortruckparking, carparkcharges, contactname, contactnumber, othertenants, officestate, officecity,
           officestreet, officepincode, officecountry,availablity,locatedin,dockheight,
           docklevel,
           advance,
           roadwidth,
           labourroom,
           guardroom,
           powerconnection,
           waterconnection,
           flooringloadingcapacity,
           noofkeys,
           architectname,
           banquetcapacity,
           noofservicelifts,
           noofcarparking,
         length,
         width,
         unit,
         plotunit,
         plotlength,
         plotwidth,
         perunitcost,
         saleablearea,
         quotedcost,
         chargeblearea,
         quotedrentpermonth,
         tenure,
         floorno,
         area,
         possessiondate,
         leaseexpirationdate,
         furnishedstatus,
         nearbywarehouses,

        areadetails,
        heightdetails,
        pricingorrental
        // pricingorrentaldetails
      } = req.body
      const errors = []
      const leadRec = {}

      //console.log("fnm", req.body.hasOwnProperty("salutation"));
      if (req.body.hasOwnProperty("firstname")) {
        leadRec.firstname = firstname;
    }
    if (req.body.hasOwnProperty("lastname")) {
        leadRec.lastname = lastname;
    }
    if (req.body.hasOwnProperty("salutation")) {
        leadRec.salutation = salutation;
    }
    if (req.body.hasOwnProperty("designation")) {
        leadRec.designation = designation;
    }
    if (req.body.hasOwnProperty("email")) {
        leadRec.email = email;
    }
    if (req.body.hasOwnProperty("phone")) {
        leadRec.phone = phone;
    }
    if (req.body.hasOwnProperty("alternatephone")) {
        leadRec.alternatephone = alternatephone;
    }
    if (req.body.hasOwnProperty("clientstreet")) {
        leadRec.clientstreet = clientstreet;
    }
    if (req.body.hasOwnProperty("clientcity")) {
        leadRec.clientcity = clientcity;
    }
    if (req.body.hasOwnProperty("clientstate")) {
        leadRec.clientstate = clientstate;
    }
    if (req.body.hasOwnProperty("clientcountry")) {
        leadRec.clientcountry = clientcountry;
    }
    if (req.body.hasOwnProperty("clientpincode")) {
        leadRec.clientpincode = clientpincode;
    }
    if (req.body.hasOwnProperty("clientcalloption")) {
        leadRec.clientcalloption = clientcalloption;
    }
    if (req.body.hasOwnProperty("clientcalloptionemail")) {
        leadRec.clientcalloptionemail = clientcalloptionemail;
    }
    if (req.body.hasOwnProperty("clientcalloptionname")) {
        leadRec.clientcalloptionname = clientcalloptionname;
    }
    if (req.body.hasOwnProperty("clientcalloptionmobile")) {
        leadRec.clientcalloptionmobile = clientcalloptionmobile;
    }
    if (req.body.hasOwnProperty("clientcalloptiondate")) {
        leadRec.clientcalloptiondate = clientcalloptiondate;
    }
    if (req.body.hasOwnProperty("clientcalloptionremark")) {
        leadRec.clientcalloptionremark = clientcalloptionremark;
    }
    if (req.body.hasOwnProperty("clientcalloptionratepersqfeet")) {
        leadRec.clientcalloptionratepersqfeet = clientcalloptionratepersqfeet;
    }
    if (req.body.hasOwnProperty("clientcalloptionbrokerage")) {
        leadRec.clientcalloptionbrokerage = clientcalloptionbrokerage;
    }
    if (req.body.hasOwnProperty("transactiontype")) {
        leadRec.transactiontype = transactiontype;
    }
    if (req.body.hasOwnProperty("typeofclient")) {
        leadRec.typeofclient = typeofclient;
    }
    if (req.body.hasOwnProperty("vertical")) {
        leadRec.vertical = vertical;
    }
    if (req.body.hasOwnProperty("verticaltype")) {
        leadRec.verticaltype = verticaltype;
    }
    if (req.body.hasOwnProperty("subverticaltype")) {
        leadRec.subverticaltype = subverticaltype;
    }
    if (req.body.hasOwnProperty("zone")) {
        leadRec.zone = zone;
    }
    if (req.body.hasOwnProperty("type")) {
        leadRec.type = type;
    }
    if (req.body.hasOwnProperty("otherlocations")) {
        leadRec.otherlocations = otherlocations;
    }
    if (req.body.hasOwnProperty("otherdetails")) {
        leadRec.otherdetails = otherdetails;
    }
    if (req.body.hasOwnProperty("areaorlocationbrief")) {
        leadRec.areaorlocationbrief = areaorlocationbrief;
    }
    if (req.body.hasOwnProperty("completiondate")) {
        leadRec.completiondate = completiondate;
    }
    if (req.body.hasOwnProperty("ownerid")) {
        leadRec.ownerid = ownerid;
    }
    if (req.body.hasOwnProperty("leadsource")) {
        leadRec.leadsource = leadsource;
    }
    if (req.body.hasOwnProperty("leadstage")) {
        leadRec.leadstage = leadstage;
    }
    if (req.body.hasOwnProperty("company")) {
        leadRec.company = company;
    }
    if (req.body.hasOwnProperty("noofdocksvalue")) {
        leadRec.noofdocksvalue = noofdocksvalue;
    }
    if (req.body.hasOwnProperty("noofwashroomsvalue")) {
        leadRec.noofwashroomsvalue = noofwashroomsvalue;
    }
    if (req.body.hasOwnProperty("openareaunit")) {
        leadRec.openareaunit = openareaunit;
    }
    if (req.body.hasOwnProperty("openareavalue")) {
        leadRec.openareavalue = openareavalue;
    }
    if (req.body.hasOwnProperty("closeareaunit")) {
        leadRec.closeareaunit = closeareaunit;
    }
    if (req.body.hasOwnProperty("closeareavalue")) {
        leadRec.closeareavalue = closeareavalue;
    }
    if (req.body.hasOwnProperty("rentalunit")) {
        leadRec.rentalunit = rentalunit;
    }
    if (req.body.hasOwnProperty("rentalvalue")) {
        leadRec.rentalvalue = rentalvalue;
    }
    if (req.body.hasOwnProperty("clienttype")) {
        leadRec.clienttype = clienttype;
    }
    if (req.body.hasOwnProperty("retailsubvertical")) {
        leadRec.retailsubvertical = retailsubvertical;
    }
    if (req.body.hasOwnProperty("typeofwarehouse")) {
        leadRec.typeofwarehouse = typeofwarehouse;
    }
    if (req.body.hasOwnProperty("floor")) {
        leadRec.floor = floor;
    }
    if (req.body.hasOwnProperty("chargeablearea")) {
        leadRec.chargeablearea = chargeablearea;
    }
    if (req.body.hasOwnProperty("offeredcarpetarea")) {
        leadRec.offeredcarpetarea = offeredcarpetarea;
    }
    if (req.body.hasOwnProperty("heightside")) {
        leadRec.heightside = heightside;
    }
    if (req.body.hasOwnProperty("heightcenter")) {
        leadRec.heightcenter = heightcenter;
    }
    if (req.body.hasOwnProperty("typeofflooring")) {
        leadRec.typeofflooring = typeofflooring;
    }
    if (req.body.hasOwnProperty("firehydrants")) {
        leadRec.firehydrants = firehydrants;
    }
    if (req.body.hasOwnProperty("firesprinkelers")) {
        leadRec.firesprinkelers = firesprinkelers;
    }
    if (req.body.hasOwnProperty("firenoc")) {
        leadRec.firenoc = firenoc;
    }
    if (req.body.hasOwnProperty("quotedrentonchargeablearea")) {
        leadRec.quotedrentonchargeablearea = quotedrentonchargeablearea;
    }
    if (req.body.hasOwnProperty("securitydeposit")) {
        leadRec.securitydeposit = securitydeposit;
    }
    if (req.body.hasOwnProperty("commonareamaintaince")) {
        leadRec.commonareamaintaince = commonareamaintaince;
    }
    if (req.body.hasOwnProperty("possessionstatus")) {
        leadRec.possessionstatus = possessionstatus;
    }
    if (req.body.hasOwnProperty("addtionalinformation")) {
        leadRec.addtionalinformation = addtionalinformation;
    }
    if (req.body.hasOwnProperty("project")) {
        leadRec.project = project;
    }
    if (req.body.hasOwnProperty("location")) {
        leadRec.location = location;
    }
    if (req.body.hasOwnProperty("totalfloors")) {
        leadRec.totalfloors = totalfloors;
    }
    if (req.body.hasOwnProperty("totalbuilduparea")) {
        leadRec.totalbuilduparea = totalbuilduparea;
    }
    if (req.body.hasOwnProperty("offeredspacedetails")) {
        leadRec.offeredspacedetails = offeredspacedetails;
    }
    if (req.body.hasOwnProperty("flooroffered")) {
        leadRec.flooroffered = flooroffered;
    }
    if (req.body.hasOwnProperty("quotedrent")) {
        leadRec.quotedrent = quotedrent;
    }
    if (req.body.hasOwnProperty("maintainancecharges")) {
        leadRec.maintainancecharges = maintainancecharges;
    }
    if (req.body.hasOwnProperty("powerbackup")) {
        leadRec.powerbackup = powerbackup;
    }
    if (req.body.hasOwnProperty("powerallocation")) {
        leadRec.powerallocation = powerallocation;
    }
    if (req.body.hasOwnProperty("powerbackupsystem")) {
        leadRec.powerbackupsystem = powerbackupsystem;
    }
    if (req.body.hasOwnProperty("powerbackupcharges")) {
        leadRec.powerbackupcharges = powerbackupcharges;
    }
    if (req.body.hasOwnProperty("othergeneralterms")) {
        leadRec.othergeneralterms = othergeneralterms;
    }
    if (req.body.hasOwnProperty("proposedleaseterm")) {
        leadRec.proposedleaseterm = proposedleaseterm;
    }
    if (req.body.hasOwnProperty("proposedlockperiod")) {
        leadRec.proposedlockperiod = proposedlockperiod;
    }
    if (req.body.hasOwnProperty("rentescalation")) {
        leadRec.rentescalation = rentescalation;
    }
    if (req.body.hasOwnProperty("intrestfreesecuritydeposit")) {
        leadRec.intrestfreesecuritydeposit = intrestfreesecuritydeposit;
    }
    if (req.body.hasOwnProperty("propertytax")) {
        leadRec.propertytax = propertytax;
    }
    if (req.body.hasOwnProperty("stampdutyregistrationcharges")) {
        leadRec.stampdutyregistrationcharges = stampdutyregistrationcharges;
    }
    if (req.body.hasOwnProperty("parkingcharges")) {
        leadRec.parkingcharges = parkingcharges;
    }
    if (req.body.hasOwnProperty("availability")) {
        leadRec.availability = availability;
    }
    if (req.body.hasOwnProperty("marketbrand")) {
        leadRec.marketbrand = marketbrand;
    }
    if (req.body.hasOwnProperty("googlecoordinates")) {
        leadRec.googlecoordinates = googlecoordinates;
    }
    if (req.body.hasOwnProperty("offeredarea")) {
        leadRec.offeredarea = offeredarea;
    }
    if (req.body.hasOwnProperty("frontagearea")) {
        leadRec.frontagearea = frontagearea;
    }
    if (req.body.hasOwnProperty("commercialterms")) {
        leadRec.commercialterms = commercialterms;
    }
    if (req.body.hasOwnProperty("heightfloor")) {
        leadRec.heightfloor = heightfloor;
    }
    if (req.body.hasOwnProperty("remark")) {
        leadRec.remark = remark;
    }
    if (req.body.hasOwnProperty("verticalname")) {
        leadRec.verticalname = verticalname;
    }
    if (req.body.hasOwnProperty("floorplatesize")) {
        leadRec.floorplatesize = floorplatesize;
    }
    if (req.body.hasOwnProperty("chargeableareaoffered")) {
        leadRec.chargeableareaoffered = chargeableareaoffered;
    }
    if (req.body.hasOwnProperty("workinghours")) {
        leadRec.workinghours = workinghours;
    }
    if (req.body.hasOwnProperty("status")) {
        leadRec.status = status;
    }
    if (req.body.hasOwnProperty("fitoutrental")) {
        leadRec.fitoutrental = fitoutrental;
    }
    if (req.body.hasOwnProperty("propertystatus")) {
        leadRec.propertystatus = propertystatus;
    }
    if (req.body.hasOwnProperty("electriccharges")) {
        leadRec.electriccharges = electriccharges;
    }
    if (req.body.hasOwnProperty("numberofcarortruckparking")) {
        leadRec.numberofcarortruckparking = numberofcarortruckparking;
    }
    if (req.body.hasOwnProperty("carparkcharges")) {
        leadRec.carparkcharges = carparkcharges;
    }
    if (req.body.hasOwnProperty("contactname")) {
        leadRec.contactname = contactname;
    }
    if (req.body.hasOwnProperty("contactnumber")) {
        leadRec.contactnumber = contactnumber;
    }
    if (req.body.hasOwnProperty("othertenants")) {
        leadRec.othertenants = othertenants;
    }
    if (req.body.hasOwnProperty("officestate")) {
        leadRec.officestate = officestate;
    }
    if (req.body.hasOwnProperty("officecity")) {
        leadRec.officecity = officecity;
    }
    if (req.body.hasOwnProperty("officestreet")) {
        leadRec.officestreet = officestreet;
    }
    if (req.body.hasOwnProperty("officepincode")) {
        leadRec.officepincode = officepincode;
    }
    if (req.body.hasOwnProperty("officecountry")) {
        leadRec.officecountry = officecountry;
    }
    
    if (req.body.hasOwnProperty("availablity")) {
        leadRec.availablity = availablity;
        }
        if (req.body.hasOwnProperty("locatedin")) {
            leadRec.locatedin = locatedin;
      }
      if (req.body.hasOwnProperty("dockheight")) {
        leadRec.dockheight = dockheight;
    }
    
    if (req.body.hasOwnProperty("docklevel")) {
        leadRec.docklevel = docklevel;
    }
    
    if (req.body.hasOwnProperty("advance")) {
        leadRec.advance = advance;
    }
    
    if (req.body.hasOwnProperty("roadwidth")) {
        leadRec.roadwidth = roadwidth;
    }
    
    if (req.body.hasOwnProperty("labourroom")) {
        leadRec.labourroom = labourroom;
    }
    
    if (req.body.hasOwnProperty("guardroom")) {
        leadRec.guardroom = guardroom;
    }
    
    if (req.body.hasOwnProperty("powerconnection")) {
        leadRec.powerconnection = powerconnection;
    }
    
    if (req.body.hasOwnProperty("waterconnection")) {
        leadRec.waterconnection = waterconnection;
    }
    
    if (req.body.hasOwnProperty("flooringloadingcapacity")) {
        leadRec.flooringloadingcapacity = flooringloadingcapacity;
    }
    
    if (req.body.hasOwnProperty("noofkeys")) {
        leadRec.noofkeys = noofkeys;
    }
    
    if (req.body.hasOwnProperty("architectname")) {
        leadRec.architectname = architectname;
    }
    
    if (req.body.hasOwnProperty("banquetcapacity")) {
        leadRec.banquetcapacity = banquetcapacity;
    }
    
    if (req.body.hasOwnProperty("noofservicelifts")) {
        leadRec.noofservicelifts = noofservicelifts;
    }
    
    if (req.body.hasOwnProperty("noofcarparking")) {
        leadRec.noofcarparking = noofcarparking;
    }

    if (req.body.hasOwnProperty("length")) {
        leadRec.length = length;
    }
    if (req.body.hasOwnProperty("width")) {
        leadRec.width = width;
    }
    if (req.body.hasOwnProperty("unit")) {
        leadRec.unit = unit;
    }
    if (req.body.hasOwnProperty("plotunit")) {
        leadRec.plotunit = plotunit;
    }
    if (req.body.hasOwnProperty("plotlength")) {
        leadRec.plotlength = plotlength;
    }
    if (req.body.hasOwnProperty("plotwidth")) {
        leadRec.plotwidth = plotwidth;
    }
    if (req.body.hasOwnProperty("perunitcost")) {
        leadRec.perunitcost = perunitcost;
    }
    if (req.body.hasOwnProperty("saleablearea")) {
        leadRec.saleablearea = saleablearea;
    }
    if (req.body.hasOwnProperty("quotedcost")) {
        leadRec.quotedcost = quotedcost;
    }
    if (req.body.hasOwnProperty("chargeblearea")) {
        leadRec.chargeblearea = chargeblearea;
    }
    if (req.body.hasOwnProperty("quotedrentpermonth")) {
        leadRec.quotedrentpermonth = quotedrentpermonth;
    }

    if (req.body.hasOwnProperty("tenure")) {
        leadRec.tenure = tenure;
    }
    
    if (req.body.hasOwnProperty("floorno")) {
        leadRec.floorno = floorno;
      }
      if (req.body.hasOwnProperty("area")) {
        leadRec.area = area;
      }

      if (req.body.hasOwnProperty("possessiondate")&&
      req.body.possessiondate != "") {
        leadRec.possessiondate = possessiondate;
      }

      if (req.body.hasOwnProperty("furnishedstatus")) {
        leadRec.furnishedstatus = furnishedstatus;
      }
      if (req.body.hasOwnProperty("leaseexpirationdate")&&
      req.body.leaseexpirationdate != "") {
        leadRec.leaseexpirationdate = leaseexpirationdate;
      }
      if (req.body.hasOwnProperty("nearbywarehouses")) {
        leadRec.nearbywarehouses = nearbywarehouses;
      }

      // if (errors.length !== 0) {
      //   return res.status(400).json({ errors: errors });
      // }
      Lead.init(req.userinfo.tenantcode)
      let resultLead = await Lead.findById(req.params.id)

      //console.log("res", resultLead);

      if (resultLead) {
        //console.log('req.userinfo:', req.userinfo);
        let updateResult = await Lead.updateById(
          req.params.id,
          leadRec,
          areadetails,
          heightdetails,
          pricingorrental,
          req.userinfo.id
        )
        console.log("updateResult *==>", updateResult)
        console.log("file: lead.routes.js:483 - router.put - resultLead - ", resultLead)
        if (resultLead) {
          leadRec['id'] = req.params.id;
          if(resultLead.ownerid != leadRec.ownerid){
            console.log('ownerid is changed, calling create Notificatoin');
            Notification.createNotificationRecord('lead_reassign', leadRec, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
          }
          if(resultLead.leadstage != leadRec.leadstage){
            console.log('leadstage is changed, calling create Notificatoin');
            Notification.createNotificationRecord('lead_stage', leadRec, req.userinfo.id, app.get('socket'), req.userinfo.tenantcode)
          }
          return res
            .status(200)
            .json({ success: true, message: "Record updated successfully" })
        }
        return res.status(200).json(resultLead)
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" })
      }
    } catch (error) {
      console.log("error:", error)
      res.status(400).json({ errors: error })
    }
  })

  // .................................................Delete Lead............................
  router.delete("/:id", fetchUser, async (req, res) => {
    //Check permissions
    const permission = req.userinfo.permissions.find(
      (el) =>
        el.name === permissions.DELETE_LEAD ||
        el.name === permissions.MODIFY_ALL
    )
    if (!permission) return res.status(401).json({ errors: "Unauthorized" })
    Lead.init(req.userinfo.tenantcode)
    const result = await Lead.deleteLead(req.params.id)
    if (!result)
      return res
        .status(200)
        .json({ success: false, message: "No record found" })

    res.status(200).json({ success: true, message: "Successfully Deleted" })
  })

  // // ..........................................Interested Property Create Lead FROM WEBSITE..........................................
  // router.post("/interested/propertylead/:tenantcode", [], async (req, res) => {
  //   if (!req.body) res.status(400).json({ errors: "Bad Request" });

  //   try {
  //     Lead.init(req.params.tenantcode);
  //     const leadRec = await Lead.interestedPropertyCreateLead(req.body);

  //     console.log("leadRec:", leadRec);
  //     if (!leadRec) {
  //       return res.status(400).json({ errors: "Bad Request" });
  //     }

  //     res.status(201).json(leadRec);
  //     let newLead = await Lead.findById(leadRec.id);
  //     if (newLead.owneremail) {
  //       let email = Lead.prepareMailForNewLead(newLead);
  //       console.log("email:", email);
  //       // const userRec = await Auth.findById(req.userinfo.id);
  //       let fromAdd = `System Admin <demo@indicrm.io>`;
  //       Mailer.sendEmail(newLead.owneremail, email.subject, email.body, fromAdd);
  //     }

  //   } catch (error) {
  //     console.log("===", JSON.stringify(error));
  //     return res.status(400).json({ errors: error });
  //   }
  // });

  // Delete all Tutorials
  //router.delete("/", leads.deleteAll);

  app.use(process.env.BASE_API_URL + "/api/leads", router)
}
