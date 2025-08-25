const User = require("../models/userModel");
const STATUS_CODES = require("../statusCodes");
const asyncHandler = require("./asyncHandler");
const jwt = require("jsonwebtoken");

const generaterefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const user = await User.findOne(refreshToken);

  if (!user || user.refreshToken !== refreshToken) {
    res.status(STATUS_CODES.UNAUTHORIZED)
    throw new Error("Invalid refresh token")
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRY,
  });

  return res.status(STATUS_CODES.OK).json({ token });
});
module.exports = generaterefreshToken