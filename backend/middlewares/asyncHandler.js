const logger = require('../config/loggerConfig');
const STATUS_CODES = require('../statusCodes');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        let statusCode
        logger.error(error);
        if (error.name === "TokenExpiredError") {
            statusCode = STATUS_CODES.UNAUTHORIZED;
        }
        else if (error.status) {
            statusCode = error.status;
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