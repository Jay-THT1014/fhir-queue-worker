const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapEncounter(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Encounter",
    identifier: buildIdentifier(sourceSystem, "Encounter", data.id),
    status: data.status || "finished",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: "AMB",
      display: "ambulatory",
    },
    period:
      data.encounterStart || data.encounterEnd
        ? {
            start: data.encounterStart || undefined,
            end: data.encounterEnd || undefined,
          }
        : undefined,
    location: data.locationRef
      ? [
          {
            location: {
              reference: data.locationRef,
              display: data.locationName || undefined,
            },
            status: "completed",
            period:
              data.start || data.end
                ? {
                    start: data.start || undefined,
                    end: data.end || undefined,
                  }
                : undefined,
          },
        ]
      : undefined,
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id)),
    participant: data.doctor_id
      ? [
          {
            individual: buildReference(
              "Practitioner",
              await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.doctor_id),
            ),
          },
        ]
      : undefined,
    serviceProvider: buildReference(
      "Organization",
      await resolveFhirId(db, tenantId, sourceSystem, "Organization", data.organization_id),
    ),
  };
}

module.exports = mapEncounter;
