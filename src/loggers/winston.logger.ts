import path from "path";
import winston from "winston";

/**
 * Custom severity levels.
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Add colors to each level.
 */
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
});

/**
 * Timestamp format.
 */
const timestampFormat = { format: "YYYY-MM-DD HH:mm:ss" };

/**
 * File log format.
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(timestampFormat),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

/**
 * Console log format with color.
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ level: true, message: true }),
  winston.format.timestamp(timestampFormat),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

/**
 * Define transports.
 */
const transports = [
  new winston.transports.File({
    filename: path.resolve("../../logs/error.log"),
    level: "error",
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: path.resolve("../../logs/info.log"),
    level: "info",
    format: fileFormat,
  }),
  new winston.transports.Console({
    level: "debug",
    format: consoleFormat,
  }),
];

/**
 * Create the logger.
 */
const logger = winston.createLogger({
  levels,
  level: "debug",
  transports,
  exitOnError: false,
});

export default logger;
