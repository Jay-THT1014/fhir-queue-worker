const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapDiagnosticReport(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "DiagnosticReport",
    identifier: buildIdentifier(sourceSystem, "DiagnosticReport", data.id),
    status: data.status || "final",
    code: { coding: [{ system: "http://loinc.org", code: data.code || "unknown" }] },
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    effectiveDateTime: data.effectiveDateTime || new Date().toISOString(),
  };
}

module.exports = mapDiagnosticReport;
