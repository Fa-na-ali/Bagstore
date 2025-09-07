const winston = require('winston');
require('winston-daily-rotate-file');

var transport = new (winston.transports.DailyRotateFile)({
  filename: 'errors-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '7d',
  level: "error"
});
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    transport
  ],
});

module.exports = logger;