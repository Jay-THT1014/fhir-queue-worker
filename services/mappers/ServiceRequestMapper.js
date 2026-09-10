const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapServiceRequest(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "ServiceRequest",
    identifier: buildIdentifier(sourceSystem, "ServiceRequest", data.id),
    status: data.status || "active",
    intent: data.intent || "order",
    code: data.code ? { coding: [{ system: "http://snomed.info/sct", code: data.code }] } : undefined,
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    authoredOn: data.authoredOn || new Date().toISOString(),
  };
}

module.exports = mapServiceRequest;
