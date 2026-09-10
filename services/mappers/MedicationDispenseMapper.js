const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapMedicationDispense(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "MedicationDispense",
    identifier: buildIdentifier(sourceSystem, "MedicationDispense", data.id),
    status: data.status || "completed",
    medicationCodeableConcept: {
      coding: [{ system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: data.medication_code || "unknown" }],
    },
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    whenHandedOver: data.whenHandedOver || undefined,
  };
}

module.exports = mapMedicationDispense;
