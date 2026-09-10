require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { MedplumClient } = require("@medplum/core");
const fetch = require("node-fetch");
const db = require("../config/db");
const logger = require("../utils/logger");

const MEDPLUM_BASE_URL = process.env.MEDPLUM_BASE_URL || "http://localhost:8103/";
const MEDPLUM_CLIENT_ID = process.env.MEDPLUM_CLIENT_ID;
const MEDPLUM_CLIENT_SECRET = process.env.MEDPLUM_CLIENT_SECRET;

const medplum = new MedplumClient({
  baseUrl: MEDPLUM_BASE_URL,
  fetch: fetch,
});

async function resolveUuid(resourceType, sourceId) {
  const result = await db.query(
    `SELECT fhir_resource_id FROM fhir_resource_mapping WHERE resource_type = $1 AND source_id = $2 LIMIT 1`,
    [resourceType, String(sourceId)],
  );
  return result.rows.length > 0 ? result.rows[0].fhir_resource_id : null;
}

async function fixReference(refObj) {
  if (!refObj || !refObj.reference) return false;
  const parts = refObj.reference.split("/");
  if (parts.length === 2 && !parts[1].includes("-")) {
    const resType = parts[0];
    const sourceId = parts[1];
    const uuid = await resolveUuid(resType, sourceId);
    if (uuid) {
      refObj.reference = `${resType}/${uuid}`;
      return true;
    }
  }
  return false;
}

async function processResources(resourceType) {
  logger.info(`Fetching all ${resourceType}s...`);
  let bundle = await medplum.search(resourceType, new URLSearchParams({ _count: 100 }));
  while (bundle) {
    if (!bundle.entry) break;

    for (const entry of bundle.entry) {
      const resource = entry.resource;
      let updated = false;

      if (resourceType === "Observation") {
        if (await fixReference(resource.subject)) updated = true;
        if (await fixReference(resource.encounter)) updated = true;
        if (resource.performer) {
          for (const p of resource.performer) {
            if (await fixReference(p)) updated = true;
          }
        }
      } else if (resourceType === "Encounter") {
        if (await fixReference(resource.subject)) updated = true;
        if (await fixReference(resource.serviceProvider)) updated = true;
        if (resource.participant) {
          for (const p of resource.participant) {
            if (await fixReference(p.individual)) updated = true;
          }
        }
      } else if (resourceType === "Condition") {
        if (await fixReference(resource.subject)) updated = true;
        if (await fixReference(resource.encounter)) updated = true;
      } else if (resourceType === "Patient") {
        if (await fixReference(resource.managingOrganization)) updated = true;
        if (resource.link) {
          for (const l of resource.link) {
            if (await fixReference(l.other)) updated = true;
          }
        }
      } else if (resourceType === "Location") {
        if (await fixReference(resource.managingOrganization)) updated = true;
      }

      if (updated) {
        logger.info(`Updating ${resourceType}/${resource.id}...`);
        try {
          await medplum.updateResource(resource);
        } catch (err) {
          logger.error(`Failed to update ${resourceType}/${resource.id}: ${err.message}`);
        }
      }
    }
    const nextLink = bundle.link?.find((l) => l.relation === "next");
    if (nextLink && nextLink.url) {
      bundle = await medplum.get(nextLink.url);
    } else {
      break;
    }
  }
}

async function run() {
  if (!MEDPLUM_CLIENT_ID || !MEDPLUM_CLIENT_SECRET) {
    logger.error("Missing MEDPLUM_CLIENT_ID or MEDPLUM_CLIENT_SECRET in env.");
    process.exit(1);
  }
  await medplum.startClientLogin(MEDPLUM_CLIENT_ID, MEDPLUM_CLIENT_SECRET);
  logger.info("Logged into Medplum.");

  await processResources("Encounter");
  await processResources("Condition");
  await processResources("Observation");
  await processResources("Patient");
  await processResources("Location");

  logger.info("Done fixing Medplum data.");
  process.exit(0);
}

run().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
