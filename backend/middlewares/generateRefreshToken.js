const User = require("../models/userModel");


const generaterefreshToken = async(req,res)=>{
    const { refreshToken } = req.body;
    console.log("refresh",refreshToken)

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
       console.log("decoded user",user)
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
  
      // Generate new access token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn:process.env.ACCESS_EXPIRY,
      });
  
      res.json({ token });
    } catch (error) {
      res.status(403).json({ message: "Invalid refresh token" });
    }
}
module.exports = generaterefreshToken