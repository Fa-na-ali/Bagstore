
const express = require('express')
const jwt = require("jsonwebtoken")
const User = require("../models/userModel.js");

const authenticate = async (req, res, next) => {
  let token;
  
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      console.log("Token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);
      if (!decoded.userId) {
        console.log("noooo")
      }


      req.user = await User.findById(decoded.userId).select("-password");
      console.log("User Retrieved from DB:", req.user);
      next();
    } catch (error) {
      res.status(401)
      throw new Error("Not auhtorized, token failed")
    }
  }
  else {
    res.status(401)
    throw new Error("Not auhtorized, no token")

  }

}



const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send("Not authorized as an admin.");
  }
};

module.exports = { authenticate, authorizeAdmin };
