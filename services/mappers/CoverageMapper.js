const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapCoverage(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Coverage",
    identifier: buildIdentifier(sourceSystem, "Coverage", data.id),
    status: data.status || "active",
    type: data.type_code
      ? { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: data.type_code }] }
      : undefined,
    subscriber: data.subscriber_id
      ? buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.subscriber_id))
      : undefined,
    beneficiary: buildReference(
      "Patient",
      await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.beneficiary_id),
    ),
    period:
      data.period_start || data.period_end
        ? { start: data.period_start || undefined, end: data.period_end || undefined }
        : undefined,
    payor: [{ reference: "Organization/example" }], // Default stub as payor is required
  };
}

module.exports = mapCoverage;
