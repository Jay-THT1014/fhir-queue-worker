const { buildIdentifier, buildReference, buildAddress, buildTelecom } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapOrganization(data, sourceSystem, orgId, tenantId, db) {
  const identifiers = buildIdentifier(sourceSystem, "Organization", data.id || data.sourceId);

  if (data.npi) {
    identifiers.push({
      system: "http://hl7.org/fhir/sid/us-npi",
      value: data.npi,
    });
  }

  if (data.clia) {
    identifiers.push({
      system: "urn:oid:2.16.840.1.113883.4.7",
      value: data.clia,
    });
  }

  let endpointRef;
  if (data.endpoint) {
    const resolvedEndpoint = await resolveFhirId(db, tenantId, sourceSystem, "Endpoint", data.endpoint);
    if (resolvedEndpoint) {
      endpointRef = [ buildReference("Endpoint", resolvedEndpoint) ];
    }
  }

  return {
    resourceType: "Organization",
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-organization"]
    },
    identifier: identifiers,
    active: data.active !== undefined ? data.active : true,
    name: data.name || "Unknown Organization",
    address: buildAddress(
      data.address_line1 || data.address,
      data.address_line2,
      data.city,
      data.state,
      data.postalCode,
      data.country,
      data.address_use
    ),
    telecom: buildTelecom(data.email, data.email_use, data.phone, data.phone_use),
    endpoint: endpointRef
  };
}

module.exports = mapOrganization;
