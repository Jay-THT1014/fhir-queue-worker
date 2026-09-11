const { buildIdentifier, buildReference, buildAddress, buildTelecom } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapLocation(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Location",
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-location"]
    },
    identifier: buildIdentifier(sourceSystem, "Location", data.id || data.sourceId),
    status: data.status || "active",
    name: data.name || "Unknown Location",
    telecom: buildTelecom(data.email, data.email_use, data.phone, data.phone_use),
    address: buildAddress(
      data.address_line1 || data.address,
      data.address_line2,
      data.city,
      data.state,
      data.postalCode || data.postalcode,
      data.country,
      data.address_use || data.use
    )?.[0],
    managingOrganization: buildReference(
      "Organization",
      await resolveFhirId(db, tenantId, sourceSystem, "Organization", data.organization_id || orgId),
    ),
  };
}

module.exports = mapLocation;
