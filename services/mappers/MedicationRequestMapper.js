const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapMedicationRequest(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "MedicationRequest",
    identifier: buildIdentifier(sourceSystem, "MedicationRequest", data.id),
    status: data.status || "active",
    intent: data.intent || "order",
    medicationCodeableConcept: {
      coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: data.medication_code || "unknown" }],
    },
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    authoredOn: data.authoredOn || new Date().toISOString(),
  };
}

module.exports = mapMedicationRequest;
