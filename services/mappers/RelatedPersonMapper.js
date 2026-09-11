const { buildIdentifier, buildReference, buildAddress } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapRelatedPerson(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "RelatedPerson",
    identifier: buildIdentifier(sourceSystem, "RelatedPerson", data.id),
    patient: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id)),
    relationship: data.relationship_code
      ? [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: data.relationship_code }] }]
      : undefined,
    name: data.name ? [{ text: data.name }] : undefined,
    telecom: buildTelecom(data.email, data.email_use, data.phone, data.phone_use),
    address: buildAddress(
      data.address_line1 || data.address,
      data.address_line2,
      data.city,
      data.state,
      data.postalCode || data.postalcode,
      data.country,
      data.address_use || data.use
    ),
  };
}

module.exports = mapRelatedPerson;
