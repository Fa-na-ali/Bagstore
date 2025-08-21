const express = require('express')
const jwt = require("jsonwebtoken")
const User = require("../models/userModel.js");
const STATUS_CODES = require('../statusCodes.js');
const asyncHandler = require('./asyncHandler.js');

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      res.status(STATUS_CODES.UNAUTHORIZED)
      throw new Error("Not authorized, token invalid");
    }
    next();
  } else {
    res.status(STATUS_CODES.UNAUTHORIZED)
    throw new Error("Not authorized, no token");
  }
});

// Middleware to block users who have been disabled (isExist: false)
const blockDisabledUsers = (req, res, next) => {
  if (req.user && req.user.isExist === false) {
    return res.status(STATUS_CODES.FORBIDDEN).json({ message: "Your account has been disabled" });
  }
  next();
};

//authorization
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Not authorized as an admin" });
  }
};


module.exports = { authenticate, blockDisabledUsers, authorizeAdmin }
