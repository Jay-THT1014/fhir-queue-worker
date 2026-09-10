const { buildIdentifier, buildName, buildAddress } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapPractitioner(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Practitioner",
    identifier: buildIdentifier(sourceSystem, "Practitioner", data.id),
    name: buildName(data.first_name, data.last_name),
    address: buildAddress(data.address, data.city, data.state, data.postalcode, data.use),
  };
}

module.exports = mapPractitioner;
