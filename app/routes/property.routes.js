/**
 * Handles all incoming request for /api/properties endpoint
 * DB table for this public.property
 * Model used here is property.model.js
 * SUPPORTED API ENDPOINTS
 *              GET     /api/properties
 *              GET     /api/properties/:id
 *              POST    /api/properties
 *              PUT     /api/properties/:id
 *              DELETE  /api/properties/:id
 *
 * @author      Farhan Khan
 * @date        Feb, 2023
 * @copyright   Farhan Khan
 */

const e = require("express");
const { fetchUser } = require("../middleware/fetchuser.js");
const Property = require("../models/property.model.js");
const permissions = require("../constants/permissions.js");
const global = require("../constants/global.js");

module.exports = (app) => {
  const { body, validationResult } = require("express-validator");

  var router = require("express").Router();

  // ..........................................Create property..........................................
  router.post(
    "/",
    fetchUser,
    [
      // body('name', 'Please enter name').isLength({ min: 1 }),
      // body('type', 'Please enter type').isLength({ min: 1 }),
      // body('phone', 'Please enter valid phone (10 digit)').isLength({ min: 10 })
    ],

    async (req, res) => {
      // Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.EDIT_LEAD ||
          el.name === permissions.MODIFY_ALL
      );
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });

      const {
        name,
        street,
        city,
        state,
        country,
        pincode,
        area,
        contactid,
        ownerid,
        description,
        areameasure,
        superbuiltuparea,
        floor,
        transactiontype,
        propertybase,
        googlelocation,
        possessionstatus,
        propertytype,
        vertical,
        areatofrom,
        furnishedstatus,
        typeofclient,
        verticaltype,
        subverticaltype,
        arearangein,
        areato,
        propertycreateddate,
        leaseexpirationdate,
        possessiondate,
        officestate,
        officecity,
        officestreet,
        officecountry,
        officepincode,
        areadetails,
        heightdetails,
        noofdocksvalue,
        noofwashroomsvalue,
        openareaunit,
        openareavalue,
        closeareaunit,
        closeareavalue,
        rentalunit,
        rentalvalue,

        typeofwarehouse,
        chargeablearea,
        offeredcarpetarea,
        heightside,
        heightcenter,
        typeofflooring,
        firehydrants,
        firesprinkelers,
        firenoc,
        quotedrentonchargeablearea,
        securitydeposit,
        commonareamaintaince,
        addtionalinformation,
        project,
        location,
        totalfloors,
        totalbuilduparea,
        offeredspacedetails,
        flooroffered,
        quotedrent,
        maintainancecharges,
        powerbackup,
        powerallocation,
        powerbackupsystem,
        powerbackupcharges,
        othergeneralterms,
        proposedleaseterm,
        proposedlockperiod,
        rentescalation,
        intrestfreesecuritydeposit,
        propertytax,
        stampdutyregistrationcharges,
        parkingcharges,
        availability,
        marketbrand,
        googlecoordinates,
        offeredarea,
        frontagearea,
        commercialterms,
        heightfloor,
        remark,
        verticalname,
        floorplatesize,
        chargeableareaoffered,
        workinghours,
        status,
        fitoutrental,
        propertystatus,
        electriccharges,
        numberofcarortruckparking,
        carparkcharges,
        contactname,
        contactnumber,
        othertenants,
        designation,

        availablity,
        locatedin,
        dockheight,
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
        clientcalloptionremark,
        floorno,
        nearbywarehouses,
        retailsubvertical,

        pricingorrental
      } = req.body;

      const errors = [];
      const propertyRec = {};


      //console.log("fnm", req.body.hasOwnProperty("salutation"));
      if (req.body.hasOwnProperty("area") && req.body.area != "") {
        propertyRec.area = area;
      }
      if (
        req.body.hasOwnProperty("arearangein") &&
        req.body.arearangein != ""
      ) {
        propertyRec.arearangein = arearangein;
      }
      if (req.body.hasOwnProperty("areato") && req.body.areato != "") {
        propertyRec.areato = areato;
      }
      if (req.body.hasOwnProperty("code") && req.body.code != "") {
        propertyRec.code = code;
      }
      if (req.body.hasOwnProperty("name") && req.body.name != "") {
        propertyRec.name = name;
      }
      if (req.body.hasOwnProperty("type") && req.body.type != "") {
        propertyRec.type = type;
      }
      if (
        req.body.hasOwnProperty("description") &&
        req.body.description != ""
      ) {
        propertyRec.description = description;
      }
      if (req.body.hasOwnProperty("email") && req.body.email != "") {
        propertyRec.email = email;
      }
      if (req.body.hasOwnProperty("phone") && req.body.phone != "") {
        propertyRec.phone = phone;
      }
      if (req.body.hasOwnProperty("street") && req.body.street != "") {
        propertyRec.street = street;
      }
      if (req.body.hasOwnProperty("city") && req.body.city != "") {
        propertyRec.city = city;
      }
      if (req.body.hasOwnProperty("state") && req.body.state != "") {
        propertyRec.state = state;
      }
      if (req.body.hasOwnProperty("pincode") && req.body.pincode != "") {
        propertyRec.pincode = pincode;
      }
      if (req.body.hasOwnProperty("country") && req.body.country != "") {
        propertyRec.country = country;
      }
      if (req.body.hasOwnProperty("vidurl") && req.body.vidurl != "") {
        propertyRec.vidurl = vidurl;
      }
      if (req.body.hasOwnProperty("projectid") && req.body.projectid != "") {
        propertyRec.projectid = projectid;
      }
      if (req.body.hasOwnProperty("ownerid") && req.body.ownerid != "") {
        propertyRec.ownerid = ownerid;
      }
      if (
        req.body.hasOwnProperty("areameasure") &&
        req.body.areameasure != ""
      ) {
        propertyRec.areameasure = areameasure;
      }
      if (req.body.hasOwnProperty("showonweb") && req.body.showonweb != "") {
        propertyRec.showonweb = showonweb;
      }
      if (req.body.hasOwnProperty("cost") && req.body.cost != "") {
        propertyRec.cost = cost;
      }
      if (
        req.body.hasOwnProperty("propertyfor") &&
        req.body.propertyfor != ""
      ) {
        propertyRec.propertyfor = propertyfor;
      }
      if (
        req.body.hasOwnProperty("legalstatus") &&
        req.body.legalstatus != ""
      ) {
        propertyRec.legalstatus = legalstatus;
      }
      if (req.body.hasOwnProperty("contactid") && req.body.contactid != "") {
        propertyRec.contactid = contactid;
      }
      if (
        req.body.hasOwnProperty("superbuiltuparea") &&
        req.body.superbuiltuparea != ""
      ) {
        propertyRec.superbuiltuparea = superbuiltuparea;
      }
      if (req.body.hasOwnProperty("floor") && req.body.floor != "") {
        propertyRec.floor = floor;
      }
      if (
        req.body.hasOwnProperty("transactiontype") &&
        req.body.transactiontype != ""
      ) {
        propertyRec.transactiontype = transactiontype;
      }
      if (
        req.body.hasOwnProperty("propertybase") &&
        req.body.propertybase != ""
      ) {
        propertyRec.propertybase = propertybase;
      }
      if (
        req.body.hasOwnProperty("googlelocation") &&
        req.body.googlelocation != ""
      ) {
        propertyRec.googlelocation = googlelocation;
      }
      if (
        req.body.hasOwnProperty("possessionstatus") &&
        req.body.possessionstatus != ""
      ) {
        propertyRec.possessionstatus = possessionstatus;
      }
      if (
        req.body.hasOwnProperty("propertytype") &&
        req.body.propertytype != ""
      ) {
        propertyRec.propertytype = propertytype;
      }
      if (req.body.hasOwnProperty("vertical") && req.body.vertical != "") {
        propertyRec.vertical = vertical;
      }
      if (req.body.hasOwnProperty("areatofrom") && req.body.areatofrom != "") {
        propertyRec.areatofrom = areatofrom;
      }
      if (
        req.body.hasOwnProperty("furnishedstatus") &&
        req.body.furnishedstatus != ""
      ) {
        propertyRec.furnishedstatus = furnishedstatus;
      }
      if (
        req.body.hasOwnProperty("typeofclient") &&
        req.body.typeofclient != ""
      ) {
        propertyRec.typeofclient = typeofclient;
      }
      if (
        req.body.hasOwnProperty("verticaltype") &&
        req.body.verticaltype != ""
      ) {
        propertyRec.verticaltype = verticaltype;
      }
      if (
        req.body.hasOwnProperty("subverticaltype") &&
        req.body.subverticaltype != ""
      ) {
        propertyRec.subverticaltype = subverticaltype;
      }
      if (
        req.body.hasOwnProperty("propertycreateddate") &&
        req.body.propertycreateddate != ""
      ) {
        propertyRec.propertycreateddate = propertycreateddate;
      }
      if (
        req.body.hasOwnProperty("leaseexpirationdate") &&
        req.body.leaseexpirationdate != ""
      ) {
        propertyRec.leaseexpirationdate = leaseexpirationdate;
      }
      if (
        req.body.hasOwnProperty("possessiondate") &&
        req.body.possessiondate != ""
      ) {
        propertyRec.possessiondate = possessiondate;
      }
      if (
        req.body.hasOwnProperty("officestate") &&
        req.body.officestate != ""
      ) {
        propertyRec.officestate = officestate;
      }
      if (
        req.body.hasOwnProperty("officestreet") &&
        req.body.officestreet != ""
      ) {
        propertyRec.officestreet = officestreet;
      }
      if (req.body.hasOwnProperty("officecity") && req.body.officecity != "") {
        propertyRec.officecity = officecity;
      }
      if (
        req.body.hasOwnProperty("officecountry") &&
        req.body.officecountry != ""
      ) {
        propertyRec.officecountry = officecountry;
      }
      if (
        req.body.hasOwnProperty("officepincode") &&
        req.body.officepincode != ""
      ) {
        propertyRec.officepincode = officepincode;
      }
      //
      if (
        req.body.hasOwnProperty("noofdocksvalue") &&
        req.body.noofdocksvalue != ""
      ) {
        propertyRec.noofdocksvalue = noofdocksvalue;
      }
      if (
        req.body.hasOwnProperty("noofwashroomsvalue") &&
        req.body.noofwashroomsvalue != ""
      ) {
        propertyRec.noofwashroomsvalue = noofwashroomsvalue;
      }
      if (
        req.body.hasOwnProperty("openareaunit") &&
        req.body.openareaunit != ""
      ) {
        propertyRec.openareaunit = openareaunit;
      }
      if (
        req.body.hasOwnProperty("openareavalue") &&
        req.body.openareavalue != ""
      ) {
        propertyRec.openareavalue = openareavalue;
      }
      if (
        req.body.hasOwnProperty("closeareaunit") &&
        req.body.closeareaunit != ""
      ) {
        propertyRec.closeareaunit = closeareaunit;
      }
      if (
        req.body.hasOwnProperty("closeareavalue") &&
        req.body.closeareavalue != ""
      ) {
        propertyRec.closeareavalue = closeareavalue;
      }
      if (
        req.body.hasOwnProperty("rentalunit") &&
        req.body.rentalunit != ""
      ) {
        propertyRec.rentalunit = rentalunit;
      }
      if (
        req.body.hasOwnProperty("rentalvalue") &&
        req.body.rentalvalue != ""
      ) {
        propertyRec.rentalvalue = rentalvalue;
      }

      //newly add fields
      if (req.body.hasOwnProperty("typeofwarehouse") && req.body.typeofwarehouse != "") {
        propertyRec.typeofwarehouse = typeofwarehouse;
    }
    if (req.body.hasOwnProperty("chargeablearea") && req.body.chargeablearea != "") {
        propertyRec.chargeablearea = chargeablearea;
    }
    if (req.body.hasOwnProperty("offeredcarpetarea") && req.body.offeredcarpetarea != "") {
        propertyRec.offeredcarpetarea = offeredcarpetarea;
    }
    if (req.body.hasOwnProperty("heightside") && req.body.heightside != "") {
        propertyRec.heightside = heightside;
    }
    if (req.body.hasOwnProperty("heightcenter") && req.body.heightcenter != "") {
        propertyRec.heightcenter = heightcenter;
    }
    if (req.body.hasOwnProperty("typeofflooring") && req.body.typeofflooring != "") {
        propertyRec.typeofflooring = typeofflooring;
    }
    if (req.body.hasOwnProperty("firehydrants") && req.body.firehydrants != "") {
        propertyRec.firehydrants = firehydrants;
    }
    if (req.body.hasOwnProperty("firesprinkelers") && req.body.firesprinkelers != "") {
        propertyRec.firesprinkelers = firesprinkelers;
    }
    if (req.body.hasOwnProperty("firenoc") && req.body.firenoc != "") {
        propertyRec.firenoc = firenoc;
    }
    if (req.body.hasOwnProperty("quotedrentonchargeablearea") && req.body.quotedrentonchargeablearea != "") {
        propertyRec.quotedrentonchargeablearea = quotedrentonchargeablearea;
    }
    if (req.body.hasOwnProperty("securitydeposit") && req.body.securitydeposit != "") {
        propertyRec.securitydeposit = securitydeposit;
    }
    if (req.body.hasOwnProperty("commonareamaintaince") && req.body.commonareamaintaince != "") {
        propertyRec.commonareamaintaince = commonareamaintaince;
    }
    if (req.body.hasOwnProperty("addtionalinformation") && req.body.addtionalinformation != "") {
        propertyRec.addtionalinformation = addtionalinformation;
    }
    if (req.body.hasOwnProperty("project") && req.body.project != "") {
        propertyRec.project = project;
    }
    if (req.body.hasOwnProperty("location") && req.body.location != "") {
        propertyRec.location = location;
    }
    if (req.body.hasOwnProperty("totalfloors") && req.body.totalfloors != "") {
        propertyRec.totalfloors = totalfloors;
    }
    if (req.body.hasOwnProperty("totalbuilduparea") && req.body.totalbuilduparea != "") {
        propertyRec.totalbuilduparea = totalbuilduparea;
    }
    if (req.body.hasOwnProperty("offeredspacedetails") && req.body.offeredspacedetails != "") {
        propertyRec.offeredspacedetails = offeredspacedetails;
    }
    if (req.body.hasOwnProperty("flooroffered") && req.body.flooroffered != "") {
        propertyRec.flooroffered = flooroffered;
    }
    if (req.body.hasOwnProperty("quotedrent") && req.body.quotedrent != "") {
        propertyRec.quotedrent = quotedrent;
    }
    if (req.body.hasOwnProperty("maintainancecharges") && req.body.maintainancecharges != "") {
        propertyRec.maintainancecharges = maintainancecharges;
    }
    if (req.body.hasOwnProperty("powerbackup") && req.body.powerbackup != "") {
        propertyRec.powerbackup = powerbackup;
    }
    if (req.body.hasOwnProperty("powerallocation") && req.body.powerallocation != "") {
        propertyRec.powerallocation = powerallocation;
    }
    if (req.body.hasOwnProperty("powerbackupsystem") && req.body.powerbackupsystem != "") {
        propertyRec.powerbackupsystem = powerbackupsystem;
    }
    if (req.body.hasOwnProperty("powerbackupcharges") && req.body.powerbackupcharges != "") {
        propertyRec.powerbackupcharges = powerbackupcharges;
    }
    if (req.body.hasOwnProperty("othergeneralterms") && req.body.othergeneralterms != "") {
        propertyRec.othergeneralterms = othergeneralterms;
    }
    if (req.body.hasOwnProperty("proposedleaseterm") && req.body.proposedleaseterm != "") {
        propertyRec.proposedleaseterm = proposedleaseterm;
    }
    if (req.body.hasOwnProperty("proposedlockperiod") && req.body.proposedlockperiod != "") {
        propertyRec.proposedlockperiod = proposedlockperiod;
    }
    if (req.body.hasOwnProperty("rentescalation") && req.body.rentescalation != "") {
        propertyRec.rentescalation = rentescalation;
    }
    if (req.body.hasOwnProperty("intrestfreesecuritydeposit") && req.body.intrestfreesecuritydeposit != "") {
        propertyRec.intrestfreesecuritydeposit = intrestfreesecuritydeposit;
    }
    if (req.body.hasOwnProperty("propertytax") && req.body.propertytax != "") {
        propertyRec.propertytax = propertytax;
    }
    if (req.body.hasOwnProperty("stampdutyregistrationcharges") && req.body.stampdutyregistrationcharges != "") {
        propertyRec.stampdutyregistrationcharges = stampdutyregistrationcharges;
    }
    if (req.body.hasOwnProperty("parkingcharges") && req.body.parkingcharges != "") {
        propertyRec.parkingcharges = parkingcharges;
    }
    if (req.body.hasOwnProperty("availability") && req.body.availability != "") {
        propertyRec.availability = availability;
    }
    if (req.body.hasOwnProperty("marketbrand") && req.body.marketbrand != "") {
        propertyRec.marketbrand = marketbrand;
    }
    if (req.body.hasOwnProperty("googlecoordinates") && req.body.googlecoordinates != "") {
        propertyRec.googlecoordinates = googlecoordinates;
    }
    if (req.body.hasOwnProperty("offeredarea") && req.body.offeredarea != "") {
        propertyRec.offeredarea = offeredarea;
    }
    if (req.body.hasOwnProperty("frontagearea") && req.body.frontagearea != "") {
        propertyRec.frontagearea = frontagearea;
    }
    if (req.body.hasOwnProperty("commercialterms") && req.body.commercialterms != "") {
        propertyRec.commercialterms = commercialterms;
    }
    if (req.body.hasOwnProperty("heightfloor") && req.body.heightfloor != "") {
        propertyRec.heightfloor = heightfloor;
    }
    if (req.body.hasOwnProperty("remark") && req.body.remark != "") {
        propertyRec.remark = remark;
    }
    if (req.body.hasOwnProperty("verticalname") && req.body.verticalname != "") {
        propertyRec.verticalname = verticalname;
    }
    if (req.body.hasOwnProperty("floorplatesize") && req.body.floorplatesize != "") {
        propertyRec.floorplatesize = floorplatesize;
    }
    if (req.body.hasOwnProperty("chargeableareaoffered") && req.body.chargeableareaoffered != "") {
        propertyRec.chargeableareaoffered = chargeableareaoffered;
    }
    if (req.body.hasOwnProperty("workinghours") && req.body.workinghours != "") {
        propertyRec.workinghours = workinghours;
    }
    if (req.body.hasOwnProperty("status") && req.body.status != "") {
        propertyRec.status = status;
    }
    if (req.body.hasOwnProperty("fitoutrental") && req.body.fitoutrental != "") {
        propertyRec.fitoutrental = fitoutrental;
    }
    if (req.body.hasOwnProperty("propertystatus") && req.body.propertystatus != "") {
        propertyRec.propertystatus = propertystatus;
    }
    if (req.body.hasOwnProperty("electriccharges") && req.body.electriccharges != "") {
        propertyRec.electriccharges = electriccharges;
    }
    if (req.body.hasOwnProperty("numberofcarortruckparking") && req.body.numberofcarortruckparking != "") {
        propertyRec.numberofcarortruckparking = numberofcarortruckparking;
    }
    if (req.body.hasOwnProperty("carparkcharges") && req.body.carparkcharges != "") {
        propertyRec.carparkcharges = carparkcharges;
    }
    if (req.body.hasOwnProperty("contactname") && req.body.contactname != "") {
        propertyRec.contactname = contactname;
    }
    if (req.body.hasOwnProperty("contactnumber") && req.body.contactnumber != "") {
        propertyRec.contactnumber = contactnumber;
    }
    if (req.body.hasOwnProperty("othertenants") && req.body.othertenants != "") {
        propertyRec.othertenants = othertenants;
    }
    if (req.body.hasOwnProperty("designation") && req.body.designation != "") {
        propertyRec.designation = designation;
    }

    if (req.body.hasOwnProperty("availablity") && req.body.availablity != "") {
      propertyRec.availablity = availablity;
      }
      if (req.body.hasOwnProperty("locatedin") && req.body.locatedin != "") {
        propertyRec.locatedin = locatedin;
    }

    if (req.body.hasOwnProperty("dockheight") && req.body.dockheight != "") {
      propertyRec.dockheight = dockheight;
  }
  
  if (req.body.hasOwnProperty("docklevel") && req.body.docklevel != "") {
      propertyRec.docklevel = docklevel;
  }
  
  if (req.body.hasOwnProperty("advance") && req.body.advance != "") {
      propertyRec.advance = advance;
  }
  
  if (req.body.hasOwnProperty("roadwidth") && req.body.roadwidth != "") {
      propertyRec.roadwidth =roadwidth;
  }
  
  if (req.body.hasOwnProperty("labourroom") && req.body.labourroom != "") {
      propertyRec.labourroom = labourroom;
  }
  
  if (req.body.hasOwnProperty("guardroom") && req.body.guardroom != "") {
      propertyRec.guardroom = guardroom;
  }
  
  if (req.body.hasOwnProperty("powerconnection") && req.body.powerconnection != "") {
      propertyRec.powerconnection = powerconnection;
  }
  
  if (req.body.hasOwnProperty("waterconnection") && req.body.waterconnection != "") {
      propertyRec.waterconnection = waterconnection;
  }
  
  if (req.body.hasOwnProperty("flooringloadingcapacity") && req.body.flooringloadingcapacity != "") {
      propertyRec.flooringloadingcapacity = flooringloadingcapacity;
  }
  
  if (req.body.hasOwnProperty("noofkeys") && req.body.noofkeys != "") {
      propertyRec.noofkeys = noofkeys;
  }
  
  if (req.body.hasOwnProperty("architectname") && req.body.architectname != "") {
      propertyRec.architectname = architectname;
  }
  
  if (req.body.hasOwnProperty("banquetcapacity") && req.body.banquetcapacity != "") {
      propertyRec.banquetcapacity = banquetcapacity;
  }
  
  if (req.body.hasOwnProperty("noofservicelifts") && req.body.noofservicelifts != "") {
      propertyRec.noofservicelifts = noofservicelifts;
  }
  
  if (req.body.hasOwnProperty("noofcarparking") && req.body.noofcarparking != "") {
      propertyRec.noofcarparking = noofcarparking;
  }

  if (
    req.body.hasOwnProperty("length") &&
    req.body.length !== ""
) {
    propertyRec.length = length;
}

if (
    req.body.hasOwnProperty("width") &&
    req.body.width !== ""
) {
    propertyRec.width = width;
}

if (
    req.body.hasOwnProperty("unit") &&
    req.body.unit !== ""
) {
    propertyRec.unit = unit;
}

if (
    req.body.hasOwnProperty("plotunit") &&
    req.body.plotunit !== ""
) {
    propertyRec.plotunit = plotunit;
}

if (
    req.body.hasOwnProperty("plotlength") &&
    req.body.plotlength !== ""
) {
    propertyRec.plotlength = plotlength;
}

if (
    req.body.hasOwnProperty("plotwidth") &&
    req.body.plotwidth !== ""
) {
    propertyRec.plotwidth = plotwidth;
}

if (
    req.body.hasOwnProperty("perunitcost") &&
    req.body.perunitcost !== ""
) {
    propertyRec.perunitcost = perunitcost;
}

if (
    req.body.hasOwnProperty("saleablearea") &&
    req.body.saleablearea !== ""
) {
    propertyRec.saleablearea = saleablearea;
}

if (
    req.body.hasOwnProperty("quotedcost") &&
    req.body.quotedcost !== ""
) {
    propertyRec.quotedcost = quotedcost;
}

if (
    req.body.hasOwnProperty("chargeblearea") &&
    req.body.chargeblearea !== ""
) {
    propertyRec.chargeblearea = chargeblearea;
}

if (
    req.body.hasOwnProperty("quotedrentpermonth") &&
    req.body.quotedrentpermonth !== ""
) {
    propertyRec.quotedrentpermonth = quotedrentpermonth;
}

if (
  req.body.hasOwnProperty("tenure") &&
  req.body.tenure !== ""
) {
  propertyRec.tenure = tenure;
}

if (req.body.hasOwnProperty("floorno") && req.body.floorno != "") {
  propertyRec.floorno = floorno;
}
if (req.body.hasOwnProperty("clientcalloptionremark") && req.body.clientcalloptionremark != "") {
  propertyRec.clientcalloptionremark = clientcalloptionremark;
}
if (req.body.hasOwnProperty("nearbywarehouses") && req.body.nearbywarehouses != "") {
  propertyRec.nearbywarehouses = nearbywarehouses;
}

if (req.body.hasOwnProperty("retailsubvertical") && req.body.retailsubvertical != "") {
  propertyRec.retailsubvertical = retailsubvertical;
}

      console.log("property rec -", propertyRec);

      Property.init(req.userinfo.tenantcode);
  
      // const propertyDetailsRec = areadetails
      // const heightdetailsRec = heightdetails
      //  const result = await Property.create(propertyRec, propertyDetailsRec,heightdetailsRec, req.userinfo.id);

      // const propertyDetailsRec =[...areadetails, ...heightdetails];
      const result = await Property.create(propertyRec, areadetails,heightdetails, pricingorrental, req.userinfo.id);


      if (!result) {
        return res.status(400).json({ errors: "Bad Request" });
      }

      return res.status(201).json(result);
    }
  );

  // ..........................................Create property from facebook..........................................
  router.post("/fb", [], async (req, res) => {
    if (!req.body) res.status(400).json({ errors: "Bad Request" });

    try {
      Property.init(req.userinfo.tenantcode);
      const propertyRec = await Property.createFB(
        req.body,
        global.SYSTEM_DEFAULT_USER
      );

      console.log("propertyRec:", propertyRec);
      if (!propertyRec) {
        return res.status(400).json({ errors: "Bad Request" });
      }

      return res.status(201).json(propertyRec);
    } catch (error) {
      console.log("===", JSON.stringify(error));
      return res.status(400).json({ errors: error });
    }
  });

  // ......................................Get All property........................................
  // router.get("/", fetchUser, async (req, res) => {
  //   //Check permissions

  //   console.log("permissions.VIEW_LEAD:", permissions.VIEW_LEAD);
  //   const permission = req.userinfo.permissions.find(
  //     (el) =>
  //       el.name === permissions.VIEW_LEAD ||
  //       el.name === permissions.MODIFY_ALL ||
  //       el.name === permissions.VIEW_ALL
  //   );
  //   if (!permission) return res.status(401).json({ errors: "Unauthorized" });
  //   Property.init(req.userinfo.tenantcode);
  //   const properties = await Property.findAll();
  //   //console.log('properties:', properties);
  //   if (properties) {
  //     res.status(200).json(properties);
  //   } else {
  //     res.status(400).json({ errors: "No data" });
  //   }
  // });

  router.get("/", fetchUser, async (req, res) => {
    try {
      // Check permissions
      console.log("permissions.VIEW_LEAD:", permissions.VIEW_LEAD);
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.VIEW_LEAD ||
          el.name === permissions.MODIFY_ALL ||
          el.name === permissions.VIEW_ALL
      );
  
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
  
      Property.init(req.userinfo.tenantcode);
      const properties = await Property.findAll();
      
      if (properties) {
        res.status(200).json(properties);
      } else {
        res.status(404).json({ errors: "No properties found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: "Internal Server Error" });
    }
  });

  // .....................................Get Property by Id........................................
  router.get("/:id", fetchUser, async (req, res) => {
    try {
      // Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.VIEW_LEAD ||
          el.name === permissions.MODIFY_ALL ||
          el.name === permissions.VIEW_ALL
      );
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
  
      Property.init(req.userinfo.tenantcode);
      let resultProperty = await Property.findById(req.params.id);
  
      if (resultProperty) {
        return res.status(200).json(resultProperty);
      } else {
        return res.status(200).json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.log("System Error:", error);
      return res.status(400).json({ success: false, message: error });
    }
  });
  

  //Get Leads by Property Id

  router.get("/:id/relatedleads/", fetchUser, async (req, res) => {
    try {
      console.log("fetchUser");
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          // el.name === permissions.VIEW_CONTACT ||
          el.name === permissions.MODIFY_ALL || el.name === permissions.VIEW_ALL
      );

      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
      Property.init(req.userinfo.tenantcode);
      let resultCon = await Property.findLeadByPropertyId(req.params.id);
      if (resultCon) {
        return res.status(200).json(resultCon);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.log("error", error);
      return res.status(400).json({ success: false, message: error });
    }
  });

  //......................................Get Property by OwnerId.................................
  /*router.get("/:id/*", fetchUser, async (req, res)=>{
    try {
      console.log('--------');
      //Check permissions
      const permission = req.userinfo.permissions.find(el => el.name === permissions.VIEW_LEAD
                                                          || el.name === permissions.MODIFY_ALL
                                                          || el.name === permissions.VIEW_ALL);
      if (!permission) return res.status(401).json({errors : "Unauthorized"});
      Property.init(req.userinfo.tenantcode);
      let resultProperty = await Property.findByOwnerId(req.params.id);
      if(resultProperty){
        return res.status(200).json(resultProperty);
      }else{
        return res.status(200).json({"success" : false, "message"  : "No record found"});
      }
    } catch (error) {
      console.log('System Error:', error);
      return res.status(400).json({"success" : false, "message"  : error});
    }
  });*/

  //......................................Get Active Property by PropertyId.................................
  router.get("/:id/active", fetchUser, async (req, res) => {
    try {
      //Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.MODIFY_ALL || el.name === permissions.VIEW_ALL
      );
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
      let resultCon = await Property.findActiveProperty(req.params.id);
      if (resultCon) {
        return res.status(200).json(resultCon);
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No record found" });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error });
    }
  });

  //.........................................Update property .....................................

  router.put("/:id", fetchUser, async (req, res) => {
    try {
      // Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.EDIT_LEAD ||
          el.name === permissions.MODIFY_ALL
      );
  
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });
  
      // Extract properties from request body
      const {
        name,
        street,
        city,
        state,
        country,
        pincode,
        area,
        contactid,
        ownerid,
        description,
        areameasure,
        superbuiltuparea,
        floor,
        transactiontype,
        propertybase,
        googlelocation,
        possessionstatus,
        propertytype,
        vertical,
        areatofrom,
        furnishedstatus,
        typeofclient,
        verticaltype,
        subverticaltype,
        arearangein,
        areato,
        propertycreateddate,
        leaseexpirationdate,
        possessiondate,
        officestate,
        officecity,
        officestreet,
        officecountry,
        officepincode,
        noofdocksvalue,
        noofwashroomsvalue,
        openareaunit,
        openareavalue,
        closeareaunit,
        closeareavalue,
        rentalunit,
        rentalvalue,

        typeofwarehouse,
        chargeablearea,
        offeredcarpetarea,
        heightside,
        heightcenter,
        typeofflooring,
        firehydrants,
        firesprinkelers,
        firenoc,
        quotedrentonchargeablearea,
        securitydeposit,
        commonareamaintaince,
        addtionalinformation,
        project,
        location,
        totalfloors,
        totalbuilduparea,
        offeredspacedetails,
        flooroffered,
        quotedrent,
        maintainancecharges,
        powerbackup,
        powerallocation,
        powerbackupsystem,
        powerbackupcharges,
        othergeneralterms,
        proposedleaseterm,
        proposedlockperiod,
        rentescalation,
        intrestfreesecuritydeposit,
        propertytax,
        stampdutyregistrationcharges,
        parkingcharges,
        availability,
        marketbrand,
        googlecoordinates,
        offeredarea,
        frontagearea,
        commercialterms,
        heightfloor,
        remark,
        verticalname,
        floorplatesize,
        chargeableareaoffered,
        workinghours,
        status,
        fitoutrental,
        propertystatus,
        electriccharges,
        numberofcarortruckparking,
        carparkcharges,
        contactname,
        contactnumber,
        othertenants,
        designation,

        availablity,
        locatedin,
        dockheight,
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
        clientcalloptionremark,
        floorno,
        nearbywarehouses,
        retailsubvertical,

        areadetails,
        heightdetails,
        pricingorrental
      } = req.body;

   // Extract propertydetails from the request body
   const propertydetails = req.body.areadetails || [];
      const errors = [];
      const propertyRec = {};

      //console.log("fnm", req.body.hasOwnProperty("salutation"));
      if (req.body.hasOwnProperty("area") && req.body.area != "") {
        propertyRec.area = area;
      }
      if (
        req.body.hasOwnProperty("arearangein") &&
        req.body.arearangein != ""
      ) {
        propertyRec.arearangein = arearangein;
      }
      if (req.body.hasOwnProperty("areato") && req.body.areato != "") {
        propertyRec.areato = areato;
      }
      if (req.body.hasOwnProperty("code") && req.body.code != "") {
        propertyRec.code = code;
      }
      if (req.body.hasOwnProperty("name") && req.body.name != "") {
        console.log('name *==>',name);
        propertyRec.name = name;
        console.log(' propertyRec.name *==>', propertyRec.name);
      }
      if (req.body.hasOwnProperty("type")) {
        propertyRec.type = type;
      }
      if (
        req.body.hasOwnProperty("description")
      ) {
        propertyRec.description = description;
      }
      if (req.body.hasOwnProperty("email") && req.body.email != "") {
        propertyRec.email = email;
      }
      if (req.body.hasOwnProperty("phone") && req.body.phone != "") {
        propertyRec.phone = phone;
      }
      if (req.body.hasOwnProperty("street")) {
        propertyRec.street = street;
      }
      if (req.body.hasOwnProperty("city")) {
        propertyRec.city = city;
      }
      if (req.body.hasOwnProperty("state")) {
        propertyRec.state = state;
      }
      if (req.body.hasOwnProperty("pincode")) {
        propertyRec.pincode = pincode;
      }
      if (req.body.hasOwnProperty("country") && req.body.country != "") {
        propertyRec.country = country;
      }
      if (req.body.hasOwnProperty("vidurl") && req.body.vidurl != "") {
        propertyRec.vidurl = vidurl;
      }
      if (req.body.hasOwnProperty("projectid") && req.body.projectid != "") {
        propertyRec.projectid = projectid;
      }
      if (req.body.hasOwnProperty("ownerid") && req.body.ownerid != "") {
        propertyRec.ownerid = ownerid;
      }
      if (
        req.body.hasOwnProperty("areameasure") &&
        req.body.areameasure != ""
      ) {
        propertyRec.areameasure = areameasure;
      }
      if (req.body.hasOwnProperty("showonweb") && req.body.showonweb != "") {
        propertyRec.showonweb = showonweb;
      }
      if (req.body.hasOwnProperty("cost") && req.body.cost != "") {
        propertyRec.cost = cost;
      }
      if (
        req.body.hasOwnProperty("propertyfor") &&
        req.body.propertyfor != ""
      ) {
        propertyRec.propertyfor = propertyfor;
      }
      if (
        req.body.hasOwnProperty("legalstatus") &&
        req.body.legalstatus != ""
      ) {
        propertyRec.legalstatus = legalstatus;
      }
      if (req.body.hasOwnProperty("contactid") ) {
        propertyRec.contactid = contactid == '' ? null  : contactid;
      }
      if (
        req.body.hasOwnProperty("superbuiltuparea") &&
        req.body.superbuiltuparea != ""
      ) {
        propertyRec.superbuiltuparea = superbuiltuparea;
      }
      if (req.body.hasOwnProperty("floor")) {
        propertyRec.floor = floor;
      }
      if (
        req.body.hasOwnProperty("transactiontype") 
      ) {
        propertyRec.transactiontype = transactiontype;
      }
      if (
        req.body.hasOwnProperty("propertybase") &&
        req.body.propertybase != ""
      ) {
        propertyRec.propertybase = propertybase;
      }
      if (
        req.body.hasOwnProperty("googlelocation")
      ) {
        propertyRec.googlelocation = googlelocation;
      }
      if (req.body.hasOwnProperty("possessionstatus")) {
        propertyRec.possessionstatus = possessionstatus;
    }
      if (
        req.body.hasOwnProperty("propertytype") 
      ) {
        propertyRec.propertytype = propertytype;
      }
      if (req.body.hasOwnProperty("vertical")) {
        propertyRec.vertical = vertical;
      }
      if (req.body.hasOwnProperty("areatofrom") && req.body.areatofrom != "") {
        propertyRec.areatofrom = areatofrom;
      }
      if ( 
        req.body.hasOwnProperty("furnishedstatus") 
      ) {
        propertyRec.furnishedstatus = furnishedstatus;
      }
      if (
        req.body.hasOwnProperty("typeofclient") 
      ) {
        propertyRec.typeofclient = typeofclient;
      }
      if (
        req.body.hasOwnProperty("verticaltype")
      ) {
        propertyRec.verticaltype = verticaltype;
      }
      if (
        req.body.hasOwnProperty("subverticaltype")
      ) {
        propertyRec.subverticaltype = subverticaltype;
      }
      if (
        req.body.hasOwnProperty("propertycreateddate") &&
        req.body.propertycreateddate != ""
      ) {
        propertyRec.propertycreateddate = propertycreateddate;
      }
      if (
        req.body.hasOwnProperty("leaseexpirationdate") &&
        req.body.leaseexpirationdate != ""
      ) {
        propertyRec.leaseexpirationdate = leaseexpirationdate;
      }
      if (
        req.body.hasOwnProperty("possessiondate") &&
        req.body.possessiondate != ""
      ) {
        propertyRec.possessiondate = possessiondate;
      }
      if (
        req.body.hasOwnProperty("officestate") &&
        req.body.officestate != ""
      ) {
        propertyRec.officestate = officestate;
      }
      if (req.body.hasOwnProperty("officecity") && req.body.officecity != "") {
        propertyRec.officecity = officecity;
      }
      if (
        req.body.hasOwnProperty("officestreet") &&
        req.body.officestreet != ""
      ) {
        propertyRec.officestreet = officestreet;
      }
      if (
        req.body.hasOwnProperty("officecountry") &&
        req.body.officecountry != ""
      ) {
        propertyRec.officecountry = officecountry;
      }
      if (
        req.body.hasOwnProperty("officepincode") &&
        req.body.officepincode != ""
      ) {
        propertyRec.officepincode = officepincode;
      }
      //
      if (
        req.body.hasOwnProperty("noofdocksvalue") 
      ) {
        propertyRec.noofdocksvalue = noofdocksvalue;
      }
      if (
        req.body.hasOwnProperty("noofwashroomsvalue")
      ) {
        propertyRec.noofwashroomsvalue = noofwashroomsvalue;
      }
      if (
        req.body.hasOwnProperty("openareaunit")
      ) {
        propertyRec.openareaunit = openareaunit;
      }
      if (
        req.body.hasOwnProperty("openareavalue") 
      ) {
        propertyRec.openareavalue = openareavalue;
      }
      if (
        req.body.hasOwnProperty("closeareaunit")
      ) {
        propertyRec.closeareaunit = closeareaunit;
      }
      if (
        req.body.hasOwnProperty("closeareavalue") 
      ) {
        propertyRec.closeareavalue = closeareavalue;
      }
      if (
        req.body.hasOwnProperty("rentalunit") 
      ) {
        propertyRec.rentalunit = rentalunit;
      }
      if (
        req.body.hasOwnProperty("rentalvalue") 
      ) {
        propertyRec.rentalvalue = rentalvalue;
      }

      if (req.body.hasOwnProperty("typeofwarehouse")) {
        propertyRec.typeofwarehouse = typeofwarehouse;
    }
    if (req.body.hasOwnProperty("chargeablearea") && req.body.chargeablearea != "") {
        propertyRec.chargeablearea = chargeablearea;
    }
    if (req.body.hasOwnProperty("offeredcarpetarea")) {
        propertyRec.offeredcarpetarea = offeredcarpetarea;
    }
    if (req.body.hasOwnProperty("heightside")) {
        propertyRec.heightside = heightside;
    }
    if (req.body.hasOwnProperty("heightcenter") ) {
        propertyRec.heightcenter = heightcenter;
    }
    if (req.body.hasOwnProperty("typeofflooring")) {
        propertyRec.typeofflooring = typeofflooring;
    }
    if (req.body.hasOwnProperty("firehydrants")) {
        propertyRec.firehydrants = firehydrants;
    }
    if (req.body.hasOwnProperty("firesprinkelers")) {
        propertyRec.firesprinkelers = firesprinkelers;
    }
    if (req.body.hasOwnProperty("firenoc")) {
        propertyRec.firenoc = firenoc;
    }
    if (req.body.hasOwnProperty("quotedrentonchargeablearea")) {
        propertyRec.quotedrentonchargeablearea = quotedrentonchargeablearea;
    }
    if (req.body.hasOwnProperty("securitydeposit") ) {
        propertyRec.securitydeposit = securitydeposit;
    }
    if (req.body.hasOwnProperty("commonareamaintaince")) {
        propertyRec.commonareamaintaince = commonareamaintaince;
    }
    if (req.body.hasOwnProperty("addtionalinformation")) {
        propertyRec.addtionalinformation = addtionalinformation;
    }
    if (req.body.hasOwnProperty("project") && req.body.project != "") {
        propertyRec.project = project;
    }
    if (req.body.hasOwnProperty("location") && req.body.location != "") {
        propertyRec.location = location;
    }
    if (req.body.hasOwnProperty("totalfloors")) {
        propertyRec.totalfloors = totalfloors;
    }
    if (req.body.hasOwnProperty("totalbuilduparea") && req.body.totalbuilduparea != "") {
        propertyRec.totalbuilduparea = totalbuilduparea;
    }
    if (req.body.hasOwnProperty("offeredspacedetails") && req.body.offeredspacedetails != "") {
        propertyRec.offeredspacedetails = offeredspacedetails;
    }
    if (req.body.hasOwnProperty("flooroffered") && req.body.flooroffered != "") {
        propertyRec.flooroffered = flooroffered;
    }
    if (req.body.hasOwnProperty("quotedrent") && req.body.quotedrent != "") {
        propertyRec.quotedrent = quotedrent;
    }
    if (req.body.hasOwnProperty("maintainancecharges")) {
        propertyRec.maintainancecharges = maintainancecharges;
    }
    if (req.body.hasOwnProperty("powerbackup")) {
        propertyRec.powerbackup = powerbackup;
    }
    if (req.body.hasOwnProperty("powerallocation") && req.body.powerallocation != "") {
        propertyRec.powerallocation = powerallocation;
    }
    if (req.body.hasOwnProperty("powerbackupsystem") && req.body.powerbackupsystem != "") {
        propertyRec.powerbackupsystem = powerbackupsystem;
    }
    if (req.body.hasOwnProperty("powerbackupcharges")) {
        propertyRec.powerbackupcharges = powerbackupcharges;
    }
    if (req.body.hasOwnProperty("othergeneralterms") && req.body.othergeneralterms != "") {
        propertyRec.othergeneralterms = othergeneralterms;
    }
    if (req.body.hasOwnProperty("proposedleaseterm")) {
        propertyRec.proposedleaseterm = proposedleaseterm;
    }
    if (req.body.hasOwnProperty("proposedlockperiod")) {
        propertyRec.proposedlockperiod = proposedlockperiod;
    }
    if (req.body.hasOwnProperty("rentescalation")) {
        propertyRec.rentescalation = rentescalation;
    }
    if (req.body.hasOwnProperty("intrestfreesecuritydeposit") && req.body.intrestfreesecuritydeposit != "") {
        propertyRec.intrestfreesecuritydeposit = intrestfreesecuritydeposit;
    }
    if (req.body.hasOwnProperty("propertytax") && req.body.propertytax != "") {
        propertyRec.propertytax = propertytax;
    }
    if (req.body.hasOwnProperty("stampdutyregistrationcharges") && req.body.stampdutyregistrationcharges != "") {
        propertyRec.stampdutyregistrationcharges = stampdutyregistrationcharges;
    }
    if (req.body.hasOwnProperty("parkingcharges") && req.body.parkingcharges != "") {
        propertyRec.parkingcharges = parkingcharges;
    }
    if (req.body.hasOwnProperty("availability")) {
        propertyRec.availability = availability;
    }
    if (req.body.hasOwnProperty("marketbrand")) {
        propertyRec.marketbrand = marketbrand;
    }
    if (req.body.hasOwnProperty("googlecoordinates") && req.body.googlecoordinates != "") {
        propertyRec.googlecoordinates = googlecoordinates;
    }
    if (req.body.hasOwnProperty("offeredarea") && req.body.offeredarea != "") {
        propertyRec.offeredarea = offeredarea;
    }
    if (req.body.hasOwnProperty("frontagearea") ) {
        propertyRec.frontagearea = frontagearea;
    }
    if (req.body.hasOwnProperty("commercialterms") && req.body.commercialterms != "") {
        propertyRec.commercialterms = commercialterms;
    }
    if (req.body.hasOwnProperty("heightfloor") && req.body.heightfloor != "") {
        propertyRec.heightfloor = heightfloor;
    }
    if (req.body.hasOwnProperty("remark")) {
        propertyRec.remark = remark;
    }
    if (req.body.hasOwnProperty("verticalname") && req.body.verticalname != "") {
        propertyRec.verticalname = verticalname;
    }
    if (req.body.hasOwnProperty("floorplatesize") && req.body.floorplatesize != "") {
        propertyRec.floorplatesize = floorplatesize;
    }
    if (req.body.hasOwnProperty("chargeableareaoffered") && req.body.chargeableareaoffered != "") {
        propertyRec.chargeableareaoffered = chargeableareaoffered;
    }
    if (req.body.hasOwnProperty("workinghours") && req.body.workinghours != "") {
        propertyRec.workinghours = workinghours;
    }
    if (req.body.hasOwnProperty("status") && req.body.status != "") {
        propertyRec.status = status;
    }
    if (req.body.hasOwnProperty("fitoutrental") && req.body.fitoutrental != "") {
        propertyRec.fitoutrental = fitoutrental;
    }
    if (req.body.hasOwnProperty("propertystatus") && req.body.propertystatus != "") {
        propertyRec.propertystatus = propertystatus;
    }
    if (req.body.hasOwnProperty("electriccharges") && req.body.electriccharges != "") {
        propertyRec.electriccharges = electriccharges;
    }
    if (req.body.hasOwnProperty("numberofcarortruckparking") && req.body.numberofcarortruckparking != "") {
        propertyRec.numberofcarortruckparking = numberofcarortruckparking;
    }
    if (req.body.hasOwnProperty("carparkcharges") && req.body.carparkcharges != "") {
        propertyRec.carparkcharges = carparkcharges;
    }
    if (req.body.hasOwnProperty("contactname") && req.body.contactname != "") {
        propertyRec.contactname = contactname;
    }
    if (req.body.hasOwnProperty("contactnumber") && req.body.contactnumber != "") {
        propertyRec.contactnumber = contactnumber;
    }
    if (req.body.hasOwnProperty("othertenants")) {
        propertyRec.othertenants = othertenants;
    }
    if (req.body.hasOwnProperty("designation")) {
        propertyRec.designation = designation;
    }

    if (req.body.hasOwnProperty("availablity")) {
      propertyRec.availablity = availablity;
      }
      if (req.body.hasOwnProperty("locatedin")) {
        propertyRec.locatedin = locatedin;
    }

    if (req.body.hasOwnProperty("dockheight")) {
      propertyRec.dockheight = dockheight;
  }
  
  if (req.body.hasOwnProperty("docklevel")) {
      propertyRec.docklevel = docklevel;
  }
  
  if (req.body.hasOwnProperty("advance")) {
      propertyRec.advance = advance;
  }
  
  if (req.body.hasOwnProperty("roadwidth")) {
      propertyRec.roadwidth = roadwidth;
  }
  
  if (req.body.hasOwnProperty("labourroom")) {
      propertyRec.labourroom = labourroom;
  }
  
  if (req.body.hasOwnProperty("guardroom")) {
      propertyRec.guardroom = guardroom;
  }
  
  if (req.body.hasOwnProperty("powerconnection")) {
      propertyRec.powerconnection = powerconnection;
  }
  
  if (req.body.hasOwnProperty("waterconnection")) {
      propertyRec.waterconnection = waterconnection;
  }
  
  if (req.body.hasOwnProperty("flooringloadingcapacity")) {
      propertyRec.flooringloadingcapacity = flooringloadingcapacity;
  }
  
  if (req.body.hasOwnProperty("noofkeys") && req.body.noofkeys != "") {
      propertyRec.noofkeys = noofkeys;
  }
  
  if (req.body.hasOwnProperty("architectname") && req.body.architectname != "") {
      propertyRec.architectname = architectname;
  }
  
  if (req.body.hasOwnProperty("banquetcapacity") && req.body.banquetcapacity != "") {
      propertyRec.banquetcapacity = banquetcapacity;
  }
  
  if (req.body.hasOwnProperty("noofservicelifts") && req.body.noofservicelifts != "") {
      propertyRec.noofservicelifts = noofservicelifts;
  }
  
  if (req.body.hasOwnProperty("noofcarparking") && req.body.noofcarparking != "") {
      propertyRec.noofcarparking = noofcarparking;
  }

  if (
    req.body.hasOwnProperty("length") &&
    req.body.length !== ""
) {
    propertyRec.length = length;
}

if (
    req.body.hasOwnProperty("width") &&
    req.body.width !== ""
) {
    propertyRec.width = width;
}

if (
    req.body.hasOwnProperty("unit") 
) {
    propertyRec.unit = unit;
}

if (
    req.body.hasOwnProperty("plotunit") &&
    req.body.plotunit !== ""
) {
    propertyRec.plotunit = plotunit;
}

if (
    req.body.hasOwnProperty("plotlength") &&
    req.body.plotlength !== ""
) {
    propertyRec.plotlength = plotlength;
}

if (
    req.body.hasOwnProperty("plotwidth") &&
    req.body.plotwidth !== ""
) {
    propertyRec.plotwidth = plotwidth;
}

if (
    req.body.hasOwnProperty("perunitcost") 
) {
    propertyRec.perunitcost = perunitcost;
}

if (
    req.body.hasOwnProperty("saleablearea")
) {
    propertyRec.saleablearea = saleablearea;
}

if (
    req.body.hasOwnProperty("quotedcost")
) {
    propertyRec.quotedcost = quotedcost;
}

if (
    req.body.hasOwnProperty("chargeblearea")
) {
    propertyRec.chargeblearea = chargeblearea;
}

if (
    req.body.hasOwnProperty("quotedrentpermonth") &&
    req.body.quotedrentpermonth !== ""
) {
    propertyRec.quotedrentpermonth = quotedrentpermonth;
}

if (
  req.body.hasOwnProperty("tenure")
) {
  propertyRec.tenure = tenure;
}

if (req.body.hasOwnProperty("floorno")) {
  propertyRec.floorno = floorno;
}
if (req.body.hasOwnProperty("clientcalloptionremark")) {
  propertyRec.clientcalloptionremark = clientcalloptionremark;
}
if (req.body.hasOwnProperty("nearbywarehouses")) {
  propertyRec.nearbywarehouses = nearbywarehouses;
}
if (req.body.hasOwnProperty("retailsubvertical")){
  propertyRec.retailsubvertical = retailsubvertical;
}


  


      Property.init(req.userinfo.tenantcode);

      // Call the update function with updatedProperty and areadetails
      const result = await Property.updateById(
        req.params.id,
        propertyRec,
        areadetails,
        heightdetails,
        pricingorrental,
        req.userinfo.id
      );
      console.log("result *==>", result)
  
      if (result) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.log("error:", error);
      res.status(400).json({ errors: error });
    }
  });

  
  // .................................................Delete Property............................
  router.delete("/:id", fetchUser, async (req, res) => {
    try {
      // Check permissions
      const permission = req.userinfo.permissions.find(
        (el) =>
          el.name === permissions.DELETE_LEAD ||
          el.name === permissions.MODIFY_ALL
      );
      if (!permission) return res.status(401).json({ errors: "Unauthorized" });

      Property.init(req.userinfo.tenantcode);

      // Call the deleteProperty function to delete property and related details
      const result = await Property.deleteProperty(req.params.id);

      if (result === "Success") {
        return res.status(200).json({ success: true, message: "Successfully Deleted" });
      } else {
        return res.status(200).json({ success: false, message: "No record found" });
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });


  
  // Delete all Tutorials
  //router.delete("/", properties.deleteAll);

  //public property for website
  router.get("/public/:tenantcode", async (req, res) => {
    console.log("req.params.tenantcode", req.params.tenantcode);
    Property.init(req.params.tenantcode);
    const properties = await Property.findAllPublicProperty();
    //console.log('properties:', properties);
    if (properties) {
      res.status(200).json(properties);
    } else {
      res.status(400).json({ errors: "No data" });
    }
  });

  app.use(process.env.BASE_API_URL + "/api/properties", router);
};
