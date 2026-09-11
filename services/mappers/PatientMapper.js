const { buildIdentifier, buildReference, buildAddress, buildTelecom } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapPatient(data, sourceSystem, orgId, tenantId, db) {
  const genderRaw = data.gender ? data.gender.toString().toLowerCase() : "";
  let gender = "unknown";
  if (genderRaw.startsWith("m")) gender = "male";
  else if (genderRaw.startsWith("f")) gender = "female";

  const nameObj = {
    family: data.last_name || undefined,
    given: data.first_name ? [data.first_name] : undefined,
    suffix: data.suffix ? [data.suffix] : undefined,
  };
  if (data.middle_name) {
    if (!nameObj.given) nameObj.given = [];
    nameObj.given.push(data.middle_name);
  }

  const names = [nameObj];
  if (data.previous_name) {
    names.push({
      use: "old",
      family: data.previous_name,
    });
  }

  const extensions = [];
  if (data.race) {
    extensions.push({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
      extension: [{ url: "ombCategory", valueCoding: { system: "urn:oid:2.16.840.1.113883.6.238", code: data.race } }]
    });
  }
  if (data.ethnicity) {
    extensions.push({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",
      extension: [{ url: "ombCategory", valueCoding: { system: "urn:oid:2.16.840.1.113883.6.238", code: data.ethnicity } }]
    });
  }
  if (data.birthsex) {
    extensions.push({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
      valueCode: data.birthsex
    });
  }
  if (data.genderIdentity) {
    extensions.push({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-genderIdentity",
      valueCodeableConcept: { coding: [{ system: "http://snomed.info/sct", code: data.genderIdentity }] }
    });
  }
  if (data.sex) {
    extensions.push({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-sex",
      valueCodeableConcept: { coding: [{ system: "http://snomed.info/sct", code: data.sex }] }
    });
  }
  if (data.tribalAffiliation) {
    extensions.push({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation",
      extension: [{ url: "tribalAffiliation", valueCodeableConcept: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS", code: data.tribalAffiliation }] } }]
    });
  }

  return {
    resourceType: "Patient",
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
    },
    extension: extensions.length > 0 ? extensions : undefined,
    identifier: buildIdentifier(sourceSystem, "Patient", data.id || data.sourceId),
    active: data.active !== undefined ? data.active : true,
    name: names,
    gender: gender,
    address: buildAddress(
      data.address_line1 || data.address,
      data.address_line2,
      data.city,
      data.state,
      data.postalCode,
      data.country,
      data.address_use
    ),
    birthDate: data.dob ? new Date(data.dob).toISOString().split("T")[0] : undefined,
    telecom: buildTelecom(data.email, data.email_use, data.phone, data.phone_use),
    deceasedBoolean: data.deceasedBoolean !== undefined ? data.deceasedBoolean : undefined,
    deceasedDateTime: data.deceasedDateTime !== undefined ? data.deceasedDateTime : undefined,
    multipleBirthInteger:
      data.multipleBirthInteger !== undefined && data.multipleBirthInteger !== null
        ? data.multipleBirthInteger
        : undefined,
    multipleBirthBoolean:
      (data.multipleBirthInteger === undefined || data.multipleBirthInteger === null) &&
        data.multipleBirthBoolean !== undefined
        ? data.multipleBirthBoolean
        : undefined,
    communication:
      data.language !== undefined || data.preferred !== undefined
        ? [
          {
            language:
              data.language !== undefined
                ? {
                  coding: [
                    {
                      system: "urn:ietf:bcp:47",
                      code: data.language,
                    },
                  ],
                }
                : undefined,
            preferred: data.preferred !== undefined ? data.preferred : undefined,
          },
        ]
        : undefined,
    managingOrganization: buildReference(
      "Organization",
      await resolveFhirId(db, tenantId, sourceSystem, "Organization", orgId),
    ),
    link: data.related?.patientId
      ? [
        {
          other: buildReference(
            "Patient",
            await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.related.patientId),
          ),
          type: data.related.type || "seealso",
        },
      ]
      : undefined,
  };
}

module.exports = mapPatient;
