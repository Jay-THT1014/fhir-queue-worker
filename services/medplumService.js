const { MedplumClient } = require("@medplum/core");
const fetch = require("node-fetch");
const logger = require("../utils/logger");

const MEDPLUM_BASE_URL = process.env.MEDPLUM_BASE_URL || "http://localhost:8103/";
const MEDPLUM_CLIENT_ID = process.env.MEDPLUM_CLIENT_ID;
const MEDPLUM_CLIENT_SECRET = process.env.MEDPLUM_CLIENT_SECRET;
const MEDPLUM_PROJECT_ID = process.env.MEDPLUM_PROJECT_ID;

const medplum = new MedplumClient({
  baseUrl: MEDPLUM_BASE_URL,
  fetch: fetch,
});

async function authenticateMedplum() {
  if (!MEDPLUM_CLIENT_ID || !MEDPLUM_CLIENT_SECRET) {
    logger.warn("MEDPLUM_CLIENT_ID or MEDPLUM_CLIENT_SECRET not set. Medplum authentication skipped.");
    return false;
  }
  try {
    await medplum.startClientLogin(MEDPLUM_CLIENT_ID, MEDPLUM_CLIENT_SECRET);
    logger.info("Successfully authenticated with Medplum FHIR server");
    return true;
  } catch (error) {
    logger.error(`Medplum Authentication Failed: ${error.message}`);
    throw error;
  }
}

async function upsertResource(resource) {
  try {
    const identifier = resource.identifier && resource.identifier[0];
    if (!identifier) {
      throw new Error("Cannot sync resource without an identifier for idempotency");
    }

    const searchQuery = `identifier=${identifier.system}|${identifier.value}`;
    const searchResult = await medplum.searchResources(resource.resourceType, searchQuery);

    logger.info(`Resource: ${JSON.stringify(resource)}`);

    if (searchResult && searchResult.length > 0) {
      const existingResource = searchResult[0];

      const updatePayload = {
        ...resource,
        id: existingResource.id,
        meta: existingResource.meta,
      };

      if (MEDPLUM_PROJECT_ID) {
        updatePayload.meta = updatePayload.meta || {};
        updatePayload.meta.project = MEDPLUM_PROJECT_ID;
      }

      const updated = await medplum.updateResource(updatePayload);
      logger.info(`Successfully updated ${resource.resourceType}/${updated.id} in Medplum`);
      return updated;
    } else {
      if (MEDPLUM_PROJECT_ID) {
        resource.meta = resource.meta || {};
        resource.meta.project = MEDPLUM_PROJECT_ID;
      }

      const created = await medplum.createResource(resource);
      logger.info(`Successfully created new ${resource.resourceType}/${created.id} in Medplum`);
      return created;
    }
  } catch (error) {
    logger.error(`Medplum Sync Error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  medplum,
  authenticateMedplum,
  upsertResource,
};
