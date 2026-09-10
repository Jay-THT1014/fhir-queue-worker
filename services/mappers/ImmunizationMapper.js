const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapImmunization(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Immunization",
    identifier: buildIdentifier(sourceSystem, "Immunization", data.id),
    status: data.status || "completed",
    vaccineCode: {
      coding: [
        { system: "http://hl7.org/fhir/sid/cvx", code: data.vaccineCode, display: data.display || data.vaccineCode },
      ],
    },
    patient: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    occurrenceDateTime: data.occurrenceDateTime || new Date().toISOString(),
    primarySource: data.primarySource !== undefined ? data.primarySource : true,
    location: data.location_id
      ? buildReference("Location", await resolveFhirId(db, tenantId, sourceSystem, "Location", data.location_id))
      : undefined,
    lotNumber: data.lotNumber || undefined,
    expirationDate: data.expirationDate || undefined,
    site: data.site
      ? { coding: [{ system: "http://snomed.info/sct", code: data.site, display: data.site_display || data.site }] }
      : undefined,
    route: data.route
      ? { coding: [{ system: "http://snomed.info/sct", code: data.route, display: data.route_display || data.route }] }
      : undefined,
    doseQuantity: data.doseQuantity
      ? { value: data.doseQuantity, unit: "mg", system: "http://unitsofmeasure.org", code: "mg" }
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
    manufacturer: (data.manufacturer_id || data.manufacturer_name)
      ? {
          ...(data.manufacturer_id && {
            reference: `Organization/${await resolveFhirId(db, tenantId, sourceSystem, "Organization", data.manufacturer_id)}`,
          }),
          ...(data.manufacturer_name && { display: data.manufacturer_name }),
        }
      : undefined,
  };
}

module.exports = mapImmunization;
