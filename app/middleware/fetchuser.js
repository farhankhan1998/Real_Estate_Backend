const jwt = require("jsonwebtoken");
const Auth = require("../models/auth.model.js");

const fetchUser = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate" });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // console.log('from jwt user info:', user);
    if (user) {
      const userRec = await Auth.findById(user.id);
      if (!userRec) {
        return res.status(400).json({ errors: "Invalid User" });
      }
      req["userinfo"] = user;
      next();
    } else {
      return res.status(400).json({ errors: "Invalid User" });
    }
  } catch (error) {
    // console.log("error" , error);
    return res.status(401).send({ errors: "Please authenticate" });
  }
};

const socketAuth = async (socket, next) => {
  // console.log('in socketAuth');
  const token = socket.handshake.auth.token;
  // console.log('token :>> ', token);
  if (!token) {
    next(new Error("Token missing"));
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // console.log('user in socket auth', user);
    if (user) {
      const userRec = await Auth.findById(user.id);
      // console.log("socketAuth - userRec - ", userRec)
      if (!userRec) {
        next(new Error("Invalid User"));
      }
      // console.log('connected');
      next();
    } else {
      // console.log('not connected');
      next(new Error("Invalid User"));
    }
  } catch (error) {
    console.log("error", error);
    next(new Error("Please authenticate"));
  }
};

module.exports = { fetchUser, socketAuth };
