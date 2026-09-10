const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapSpecimen(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Specimen",
    identifier: buildIdentifier(sourceSystem, "Specimen", data.id),
    status: data.status || "available",
    type: data.type_code ? { coding: [{ system: "http://snomed.info/sct", code: data.type_code }] } : undefined,
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    collection: data.collection_datetime ? { collectedDateTime: data.collection_datetime } : undefined,
  };
}

module.exports = mapSpecimen;
