const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapGoal(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Goal",
    identifier: buildIdentifier(sourceSystem, "Goal", data.id),
    lifecycleStatus: data.lifecycleStatus || "active",
    description: { text: data.description || "Unknown goal" },
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    startDate: data.startDate || undefined,
  };
}

module.exports = mapGoal;
