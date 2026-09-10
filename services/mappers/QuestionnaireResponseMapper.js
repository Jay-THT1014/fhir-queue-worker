const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapQuestionnaireResponse(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "QuestionnaireResponse",
    identifier: buildIdentifier(sourceSystem, "QuestionnaireResponse", data.id),
    status: data.status || "completed",
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    authored: data.authored || new Date().toISOString(),
  };
}

module.exports = mapQuestionnaireResponse;
