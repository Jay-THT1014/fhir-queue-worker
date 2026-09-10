const { buildIdentifier, buildReference, buildName, buildAddress, buildTelecom } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapPatient(data, sourceSystem, orgId, tenantId, db) {
  const genderRaw = data.gender ? data.gender.toString().toLowerCase() : "";
  let gender = "unknown";
  if (genderRaw.startsWith("m")) gender = "male";
  else if (genderRaw.startsWith("f")) gender = "female";

  return {
    resourceType: "Patient",
    identifier: buildIdentifier(sourceSystem, "Patient", data.id),
    active: data.active !== undefined ? data.active : true,
    name: buildName(data.first_name, data.last_name),
    gender: gender,
    address: buildAddress(data.address, undefined, undefined, undefined, undefined),
    birthDate: data.dob ? new Date(data.dob).toISOString().split("T")[0] : undefined,
    telecom: buildTelecom(data.email),
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
