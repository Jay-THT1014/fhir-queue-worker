const { buildIdentifier } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapOrganization(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Organization",
    identifier: buildIdentifier(sourceSystem, "Organization", data.id),
    name: data.name || "Unknown Organization",
    address: data.address ? [{ text: data.address }] : undefined,
  };
}

module.exports = mapOrganization;
