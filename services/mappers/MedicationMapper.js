const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapMedication(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Medication",
    identifier: buildIdentifier(sourceSystem, "Medication", data.id),
    code: {
      coding: [
        { system: "http://www.nlm.nih.gov/research/umls/rxnorm", code: data.code, display: data.display || data.code },
      ],
    },
    status: data.status || "active",
    form: data.form_code ? { coding: [{ system: "http://snomed.info/sct", code: data.form_code }] } : undefined,
    manufacturer: data.manufacturer_id
      ? buildReference(
          "Organization",
          await resolveFhirId(db, tenantId, sourceSystem, "Organization", data.manufacturer_id),
        )
      : undefined,
    batch:
      data.lotNumber || data.expirationDate
        ? {
            lotNumber: data.lotNumber || undefined,
            expirationDate: data.expirationDate || undefined,
          }
        : undefined,
  };
}

module.exports = mapMedication;
