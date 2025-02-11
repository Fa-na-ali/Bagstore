const multer = require("multer");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./useruploads");
    },
    filename: (req, file, callback) => {
        const filename = `image-${Date.now()},${file.originalname}`;
        callback(null, filename);
    }
});

// File filter to allow only specific image formats
const filefilter = (req, file, callback) => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false);
        return callback(new Error("Only JPG, PNG, JPEG, and WEBP formats are allowed"));
    }
};

// Multer upload configuration
const imageUpload = multer({
    storage: storage,
    fileFilter: filefilter
});

module.exports = imageUpload;
