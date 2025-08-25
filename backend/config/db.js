const mongoose = require('mongoose')
const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bags';
const dotenv = require('dotenv');

dotenv.config();

//database connection
const dbConnect = async () => {
    try {

        await mongoose.connect(URI)
        console.log("Connected to database")

    } catch (error) {
        console.error(`ERROR:${error.message}`)
        process.exit(1)
    }
}

module.exports = dbConnect