const winston = require('winston');

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
  ],
});
// const transports = [];
// if (process.env.NODE_ENV !== 'development') {
//   transports.push(
//     new winston.transports.Console(),
//     new winston.transports.File({
//       filename: 'combined.log', // can save the logs to a file 
//       level: LOGGER_LEVELS.INFO
//     }),
//     new winston.transports.File({
//       filename: 'error.log',
//       level: LOGGER_LEVELS.ERROR
//     })
//   );
// } else { // for development you want the console to be printed on terminal
//   transports.push(
//     new winston.transports.Console({
//       format: winston.format.combine(winston.format.cli(), winston.format.splat())
//     })
//   );
// }

module.exports = logger;