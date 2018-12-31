import winston from 'winston';

const { combine, timestamp, printf, splat } = winston.format;
const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

export const logger = winston.createLogger({
  format: combine(timestamp(), splat(), myFormat),
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
    }),
    new winston.transports.File({
      filename: process.env.LOG_DIR + '/debug.log',
      level: 'debug'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level');
}
