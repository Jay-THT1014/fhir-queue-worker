const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapObservation(data, sourceSystem, orgId, tenantId, db) {
  const isBP =
    (data.systolic !== undefined && data.systolic !== null) ||
    (data.diastolic !== undefined && data.diastolic !== null);

  const observation = {
    resourceType: "Observation",
    identifier: buildIdentifier(sourceSystem, "Observation", data.id),
    status: data.status || "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: data.category_code || "vital-signs",
            display: data.category_display || "Vital Signs",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: data.system || "http://loinc.org",
          code: data.loinc_code || (isBP ? "85354-9" : data.code || "unknown"),
          display: data.description || (isBP ? "Blood pressure panel" : data.display || "Unknown Observation"),
        },
      ],
      text: data.text || data.description || (isBP ? "Blood Pressure" : "Observation"),
    },
    subject: buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id)),
    encounter: data.encounter_id
      ? buildReference("Encounter", await resolveFhirId(db, tenantId, sourceSystem, "Encounter", data.encounter_id))
      : undefined,
    performer: data.practitioner_id
      ? [
          buildReference(
            "Practitioner",
            await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.practitioner_id),
          ),
        ]
      : undefined,
    effectiveDateTime: data.effective_date || new Date().toISOString(),
  };

  if (isBP) {
    observation.component = [];
    if (data.systolic !== undefined && data.systolic !== null) {
      observation.component.push({
        code: {
          coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }],
        },
        valueQuantity: {
          value: data.systolic,
          unit: "mmHg",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]",
        },
      });
    }
    if (data.diastolic !== undefined && data.diastolic !== null) {
      observation.component.push({
        code: {
          coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }],
        },
        valueQuantity: {
          value: data.diastolic,
          unit: "mmHg",
          system: "http://unitsofmeasure.org",
          code: "mm[Hg]",
        },
      });
    }
  } else if (data.value !== undefined && data.value !== null) {
    observation.valueQuantity = {
      value: data.value,
      unit: data.unit || undefined,
      system: data.unit_system || "http://unitsofmeasure.org",
      code: data.unit_code || data.unit || undefined,
    };
  }

  return observation;
}

module.exports = mapObservation;
