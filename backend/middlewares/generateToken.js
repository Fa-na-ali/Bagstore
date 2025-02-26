const jwt = require("jsonwebtoken")


const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.ACCESS_EXPIRY,
    })
    const refreshToken = jwt.sign({ userId: user._id}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_EXPIRY,
    })
    console.log("tooooo::",token)
    

    return {token,refreshToken}
}
module.exports={generateToken}