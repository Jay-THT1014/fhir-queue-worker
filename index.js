require("dotenv").config();
const logger = require("./utils/logger");
const worker = require("./queue/consumer");

logger.info("Starting FHIR Queue Worker...");

const shutdown = async (signal) => {
  logger.warn(`${signal} received — shutting down worker gracefully...`);

  try {
    await worker.close();
    logger.info("Worker closed.");
    process.exit(0);
  } catch (err) {
    logger.error(`Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
