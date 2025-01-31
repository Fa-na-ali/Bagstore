const jwt = require("jsonwebtoken")

const generateToken = (res, userId,isAdmin) => {
  const token = jwt.sign({ userId,isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set JWT as an HTTP-Only Cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = {generateToken}