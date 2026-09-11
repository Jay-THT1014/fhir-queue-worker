const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapCareTeam(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "CareTeam",
    identifier: buildIdentifier(sourceSystem, "CareTeam", data.id),
    status: data.status || "active",
    name: data.name || undefined,
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subject_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    period:
      data.period_start || data.period_end
        ? { start: data.period_start || undefined, end: data.period_end || undefined }
        : undefined,
    participant: [
      {
        role: [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                version: "http://snomed.info/sct/731000124108",
                code: data.role_code,
                display: data.role_display_name
              }
            ]
          }
        ],
        member: {
          reference: data.member_reference_id,//this will be patient or practitioner or nurse user
          display: data.member_display_name
        }
      }
    ]
  };
}

module.exports = mapCareTeam;
