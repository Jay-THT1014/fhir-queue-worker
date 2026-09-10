const { buildIdentifier, buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapDevice(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Device",
    identifier: buildIdentifier(sourceSystem, "Device", data.id),
    status: data.status || "active",
    manufacturer: data.manufacturer || undefined,
    serialNumber: data.serialNumber || undefined,
    patient: data.patient_id
      ? buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.patient_id))
      : undefined,
    location: data.location_id
      ? buildReference("Location", await resolveFhirId(db, tenantId, sourceSystem, "Location", data.location_id))
      : undefined,
  };
}

module.exports = mapDevice;
