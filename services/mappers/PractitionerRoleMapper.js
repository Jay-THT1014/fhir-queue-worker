const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapPractitionerRole(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "PractitionerRole",
    identifier: buildIdentifier(sourceSystem, "PractitionerRole", data.id),
    active: data.status === "active" ? true : data.status === "inactive" ? false : undefined,
    practitioner: data.practitioner_id
      ? buildReference(
          "Practitioner",
          await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.practitioner_id),
        )
      : undefined,
    organization: data.organization_id
      ? buildReference(
          "Organization",
          await resolveFhirId(db, tenantId, sourceSystem, "Organization", data.organization_id),
        )
      : undefined,
    location: data.location_id
      ? [buildReference("Location", await resolveFhirId(db, tenantId, sourceSystem, "Location", data.location_id))]
      : undefined,
    code: data.code
      ? [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/practitioner-role", code: data.code }] }]
      : undefined,
    specialty: data.speciality_code
      ? [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: data.speciality_code,
                display: data.speciality_display || data.speciality_code,
              },
            ],
          },
        ]
      : undefined,
  };
}

module.exports = mapPractitionerRole;
