const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

// 📁 log directory
const logDir = path.join(__dirname, "../logs");

// create folder if not exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// custom format
const logFormat = format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
});

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    // ✅ All logs (Rotates daily, keeps 14 days)
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),

    // ❌ Only errors (Rotates daily, keeps 14 days)
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "14d",
    }),
  ],
});

// 👇 show logs in console in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    }),
  );
}

module.exports = logger;
