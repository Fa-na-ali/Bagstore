const STATUS_CODES = require('../statusCodes');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        let statusCode
         console.error('An error occurred:', error);
        if (error.name === "TokenExpiredError") {
            statusCode = STATUS_CODES.UNAUTHORIZED;
        }
        else if (res.statusCode && (res.statusCode !== STATUS_CODES.OK) && (res.statusCode !== STATUS_CODES.CREATED)) {
            statusCode = res.statusCode
        }
        else
            statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR

        res.status(statusCode).json({
            status: "error",
            message: error.message || "Internal Server Error",
        });
    })
}

module.exports = asyncHandler