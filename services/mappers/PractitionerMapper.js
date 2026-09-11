const { buildIdentifier, buildName, buildAddress, buildTelecom } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapPractitioner(data, sourceSystem, orgId, tenantId, db) {
  const identifiers = buildIdentifier(sourceSystem, "Practitioner", data.id || data.sourceId);

  if (data.npi) {
    identifiers.push({
      system: "http://hl7.org/fhir/sid/us-npi",
      value: data.npi,
    });
  }

  const nameObj = {
    family: data.last_name || undefined,
    given: data.first_name ? [data.first_name] : undefined,
    suffix: data.suffix ? [data.suffix] : undefined,
  };
  if (data.middle_name) {
    if (!nameObj.given) nameObj.given = [];
    nameObj.given.push(data.middle_name);
  }

  return {
    resourceType: "Practitioner",
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner"]
    },
    identifier: identifiers,
    name: [nameObj],
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

module.exports = mapPractitioner;
