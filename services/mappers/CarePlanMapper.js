const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapCarePlan(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "CarePlan",
    identifier: buildIdentifier(sourceSystem, "CarePlan", data.id),
    status: data.status || "active",
    intent: data.intent || "plan",
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    period:
      data.period_start || data.period_end
        ? { start: data.period_start || undefined, end: data.period_end || undefined }
        : undefined,
  };
}

module.exports = mapCarePlan;
