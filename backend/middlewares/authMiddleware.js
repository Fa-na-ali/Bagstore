
const express = require('express')
const jwt = require("jsonwebtoken")
const User = require("../models/userModel.js");

const authenticate = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (authHeader && authHeader.startsWith('Bearer')) {

    token = authHeader.split(' ')[1];
    console.log("Token:", token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);
      req.user = await User.findById(decoded.userId).select("-password");
      console.log("User Retrieved from DB:", req.user);
      next();

    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" }); // Let frontend handle refresh
      }
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }
}




  const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "Not authorized as an admin" });
    }
  };

  module.exports = { authenticate, authorizeAdmin }
