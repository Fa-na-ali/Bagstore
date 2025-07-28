const User = require("../models/userModel");

const generaterefreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {

    const user = await User.findOne(refreshToken);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_EXPIRY,
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
}
module.exports = generaterefreshToken