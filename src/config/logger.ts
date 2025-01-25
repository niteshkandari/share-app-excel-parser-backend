import winston from 'winston';
// Configure the property logger with a custom log format
  
  // Configure the  user logger with a custom log format
  export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(), // Include timestamp in logs
        winston.format.errors({ stack: true }), // Include stack traces for errors
        winston.format.json() // Format logs as JSON
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

  export const logger_ip = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(), // Include timestamp in logs
        winston.format.errors({ stack: true }), // Include stack traces for errors
        winston.format.json() // Format logs as JSON
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'IPerror.log', level: 'error' }),
        new winston.transports.File({ filename: 'IPcombined.log' }),
    ],
  });