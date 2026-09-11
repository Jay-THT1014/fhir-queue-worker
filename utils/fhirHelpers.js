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

function buildMetaProfile(meta) {
  return {
    profile: [
      meta
    ]
  };
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

function buildAddress(line1, line2, city, state, postalCode, country, use) {
  if (!line1 && !line2 && !city && !state && !postalCode && !country) return undefined;
  
  let addressLines = [];
  if (line1) addressLines.push(line1);
  if (line2) addressLines.push(line2);
  
  return [
    {
      use: use || undefined,
      line: addressLines.length > 0 ? addressLines : undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
      country: country || undefined,
    },
  ];
}

function buildTelecom(email, emailUse, phone, phoneUse) {
  let telecom = [];
  if (email) telecom.push({ system: "email", value: email, use: emailUse || undefined });
  if (phone) telecom.push({ system: "phone", value: phone, use: phoneUse || undefined });
  return telecom.length > 0 ? telecom : undefined;
}

module.exports = {
  buildIdentifier,
  buildReference,
  buildName,
  buildAddress,
  buildTelecom,
  buildMetaProfile,
};
