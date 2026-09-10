const { buildIdentifier, buildReference, buildAddress } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapLocation(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Location",
    identifier: buildIdentifier(sourceSystem, "Location", data.id),
    status: data.status || "active",
    name: data.name || "Unknown Location",
    address: buildAddress(data.address, data.city, data.state, data.postalcode, data.use)?.[0],
    managingOrganization: buildReference(
      "Organization",
      await resolveFhirId(db, tenantId, sourceSystem, "Organization", data.organization_id || orgId),
    ),
  };
}

module.exports = mapLocation;
