const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapFamilyMemberHistory(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "FamilyMemberHistory",
    identifier: buildIdentifier(sourceSystem, "FamilyMemberHistory", data.id),
    status: data.status || "completed",
    patient: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id)),
    date: data.date || new Date().toISOString(),
    name: data.name || "Unknown",
    relationship: data.relationship
      ? {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
              code: data.relationship,
              display: data.relationship_display || data.relationship,
            },
          ],
        }
      : undefined,
    sex: data.sex ? { coding: [{ system: "http://hl7.org/fhir/administrative-gender", code: data.sex }] } : undefined,
    condition: data.condition_code
      ? [
          {
            code: { coding: [{ system: "http://snomed.info/sct", code: data.condition_code }] },
            outcome: data.condition_outcome
              ? { coding: [{ system: "http://snomed.info/sct", code: data.condition_outcome }] }
              : undefined,
          },
        ]
      : undefined,
  };
}

module.exports = mapFamilyMemberHistory;
