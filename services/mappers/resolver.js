const logger = require("../../utils/logger");

async function resolveFhirId(db, tenantId, sourceSystem, resourceType, sourceId) {
  if (!sourceId) return undefined;
  if (!db) return sourceId;

  try {
    const result = await db.query(
      `SELECT fhir_resource_id FROM fhir_resource_mapping
       WHERE tenant_id = $1 AND source_system = $2 AND resource_type = $3 AND source_id = $4`,
      [tenantId, sourceSystem, resourceType, String(sourceId)],
    );
    if (result.rows && result.rows.length > 0) {
      return result.rows[0].fhir_resource_id;
    }
  } catch (error) {
    logger.warn(`Error resolving FHIR ID for ${resourceType} ${sourceId}: ${error.message}`);
  }
  return sourceId;
}

module.exports = { resolveFhirId };
