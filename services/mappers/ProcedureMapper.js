const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapProcedure(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Procedure",
    identifier: buildIdentifier(sourceSystem, "Procedure", data.id),
    status: data.status || "completed",
    category: data.category_code
      ? { coding: [{ system: "http://snomed.info/sct", code: data.category_code }] }
      : undefined,
    code: {
      coding: [{ system: "http://snomed.info/sct", code: data.code, display: data.display || data.code }],
    },
    subject: buildReference(
      "Patient",
      await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id || data.patient_id),
    ),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    performedDateTime: data.performedDateTime || new Date().toISOString(),
    recorder: data.recorder_id
      ? buildReference(
          "Practitioner",
          await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.recorder_id),
        )
      : undefined,
    performer: data.performer_id
      ? [
          {
            actor: buildReference(
              "Practitioner",
              await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.performer_id),
            ),
          },
        ]
      : undefined,
  };
}

module.exports = mapProcedure;
