import { createLogger, format, transports } from 'winston';

// Import transports
const { Console } = transports;

// Initialize logger
const logger = createLogger({
  level: 'info',
});

// Format for error stack traces
const errorStackFormat = format(info => {
  if (info.stack) {
    // Log stack trace to console and don't include in transport
    console.log(info.stack);
    return false;
  }
  return info;
});

// Console transport with color and simple format
const consoleTransport = new Console({
  format: format.combine(format.colorize(), format.simple(), errorStackFormat()),
});

// Add console transport to logger
logger.add(consoleTransport);

export default logger;
