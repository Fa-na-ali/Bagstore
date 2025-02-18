const jwt = require("jsonwebtoken")


const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, {
        expiresIn: '12h',
    })
    console.log("tooooo::",token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log("Decoded Token with User ID:", decoded);

    return token
}
module.exports={generateToken}