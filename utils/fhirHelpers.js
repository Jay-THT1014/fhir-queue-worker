function buildIdentifier(sourceSystem, resourceType, id) {
  if (!id) {
    throw new Error(`Missing required ID for ${resourceType}`);
  }
  return [
    {
      system: `http://${sourceSystem}/fhir/R4/${resourceType.toLowerCase()}`,
      value: String(id),
    },
  ];
}

function buildReference(resourceType, id) {
  return id ? { reference: `${resourceType}/${id}` } : undefined;
}

function buildName(firstName, lastName) {
  if (!firstName && !lastName) return undefined;
  return [
    {
      family: lastName || undefined,
      given: firstName ? [firstName] : undefined,
    },
  ];
}

function buildAddress(line, city, state, postalCode, use) {
  if (!line && !city && !state && !postalCode) return undefined;
  return [
    {
      use: use || undefined,
      line: line ? [line] : undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
    },
  ];
}

function buildTelecom(email) {
  return email ? [{ system: "email", value: email }] : undefined;
}

module.exports = {
  buildIdentifier,
  buildReference,
  buildName,
  buildAddress,
  buildTelecom,
};
