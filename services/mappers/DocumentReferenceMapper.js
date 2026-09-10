const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapDocumentReference(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "DocumentReference",
    identifier: buildIdentifier(sourceSystem, "DocumentReference", data.id),
    status: data.status || "current",
    type: data.type_code ? { coding: [{ system: "http://loinc.org", code: data.type_code }] } : undefined,
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    date: data.date || new Date().toISOString(),
    content: [{ attachment: { url: "http://example.org/doc", contentType: "text/plain" } }], // Required minimal content
  };
}

module.exports = mapDocumentReference;
