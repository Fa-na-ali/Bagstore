const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require("multer");
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Bags',
    allowedFormats:["png","jpg","jpeg","webp"],
  },
});

const imageUpload = multer({ storage });

 
module.exports={cloudinary,storage,imageUpload}