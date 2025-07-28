const express = require('express')
const jwt = require("jsonwebtoken")
const User = require("../models/userModel.js");

const authenticate = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {

        return res.status(401).json({ message: "Token expired" });
      }

      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to block users who have been disabled (isExist: false)
const blockDisabledUsers = (req, res, next) => {
  if (req.user && req.user.isExist === false) {
    return res.status(403).json({ message: "Your account has been disabled" });
  }
  next();
};


//authorization
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
};


module.exports = { authenticate, blockDisabledUsers, authorizeAdmin }
