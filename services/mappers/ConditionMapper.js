const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapCondition(data, sourceSystem, orgId, tenantId, db) {
  const categoryCode = data.category === "problem-list-item" ? "problem-list-item" : "encounter-diagnosis";
  const categoryDisplay = data.category === "problem-list-item" ? "Problem List Item" : "Encounter Diagnosis";
  const profileUrl = categoryCode === "problem-list-item"
    ? "http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-problems-health-concerns"
    : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-encounter-diagnosis";

  const defaultCategoryCodings = [
    {
      system: "http://terminology.hl7.org/CodeSystem/condition-category",
      code: categoryCode,
      display: categoryDisplay,
    },
  ];

  if (categoryCode === "encounter-diagnosis") {
    defaultCategoryCodings.push({
      system: "http://snomed.info/sct",
      code: "439401001",
      display: "Diagnosis",
    });
  } else {
    defaultCategoryCodings.push({
      system: "http://snomed.info/sct",
      code: "55607006",
      display: "Problem",
    });
  }

  return {
    resourceType: "Condition",
    meta: {
      profile: [profileUrl]
    },
    identifier: buildIdentifier(sourceSystem, "Condition", data.id || data.sourceId),
    clinicalStatus: data.clinicalStatus
      ? {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: data.clinicalStatus }],
        }
      : undefined,
    verificationStatus: data.verificationStatus
      ? {
          coding: [
            { system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: data.verificationStatus },
          ],
        }
      : undefined,
    category: [
      {
        coding: defaultCategoryCodings,
      },
    ],
    severity: data.severity_code
      ? {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: data.severity_code,
              display: data.severity_name || data.severity_code,
            },
          ],
        }
      : undefined,
    code: data.icd10_code
      ? {
          coding: [
            {
              system: "http://hl7.org/fhir/sid/icd-10",
              code: data.icd10_code,
              display: data.icd_title || data.icd10_code,
            },
          ],
        }
      : undefined,
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    onsetDateTime: data.onsetDateTime || undefined,
    onsetAge: data.onsetAge ? { value: data.onsetAge, system: "http://unitsofmeasure.org", code: "a" } : undefined,
    onsetPeriod: data.onsetPeriod
      ? {
          start: data.onsetPeriod.start || undefined,
          end: data.onsetPeriod.end || undefined,
        }
      : undefined,
    recordedDate: data.recordedDate || undefined,
    recorder: data.recorder_id
      ? buildReference(
          "Practitioner",
          await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.recorder_id),
        )
      : undefined,
    asserter: data.asserter_id
      ? buildReference(
          "Practitioner",
          await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.asserter_id),
        )
      : undefined,
    note: data.note ? [{ text: data.note }] : undefined,
  };
}

module.exports = mapCondition;
