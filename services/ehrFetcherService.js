const logger = require("../utils/logger");

async function fetchSourceData(resourceType, sourceId) {
  logger.error(
    `Missing payload data for ${resourceType} ${sourceId}. Data fetching must be done by the Outbox Publisher in a multi-DB setup.`,
  );
  throw new Error(
    `Data fetching directly from worker is disabled. Please ensure the Outbox Publisher sends 'payloadData'.`,
  );
}

module.exports = {
  fetchSourceData,
};
