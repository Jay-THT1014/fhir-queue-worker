const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapAllergyIntolerance(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "AllergyIntolerance",
    identifier: buildIdentifier(sourceSystem, "AllergyIntolerance", data.id),
    clinicalStatus: data.clinicalStatus
      ? {
          coding: [
            { system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: data.clinicalStatus },
          ],
        }
      : undefined,
    verificationStatus: data.verificationStatus
      ? {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
              code: data.verificationStatus,
            },
          ],
        }
      : undefined,
    type: data.type || undefined,
    category: data.category ? [data.category] : undefined,
    criticality: data.criticality || undefined,
    code: data.code
      ? { coding: [{ system: "http://snomed.info/sct", code: data.code, display: data.display || data.code }] }
      : undefined,
    patient: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    onsetDateTime: data.onsetDateTime || undefined,
    recorder: data.recorder_id
      ? buildReference(
          "Practitioner",
          await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.recorder_id),
        )
      : undefined,
    reaction:
      data.reaction_substance || data.reaction_manifestation
        ? [
            {
              substance: data.reaction_substance
                ? {
                    coding: [
                      {
                        code: data.reaction_substance,
                        display: data.reaction_substance_display || data.reaction_substance,
                      },
                    ],
                  }
                : undefined,
              manifestation: data.reaction_manifestation
                ? [
                    {
                      coding: [
                        {
                          code: data.reaction_manifestation,
                          display: data.reaction_manifestation_display || data.reaction_manifestation,
                        },
                      ],
                    },
                  ]
                : undefined,
              severity: data.reaction_severity || undefined,
            },
          ]
        : undefined,
  };
}

module.exports = mapAllergyIntolerance;
