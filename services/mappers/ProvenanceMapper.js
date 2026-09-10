const { buildReference } = require("../../utils/fhirHelpers");
const { resolveFhirId } = require("./resolver");

async function mapProvenance(data, sourceSystem, orgId, tenantId, db) {
  return {
    resourceType: "Provenance",
    target: [buildReference("Patient", await resolveFhirId(db, tenantId, sourceSystem, "Patient", data.target_id))],
    recorded: data.recorded || new Date().toISOString(),
    agent: [
      {
        type: data.agent_role_code
          ? {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type",
                  code: data.agent_role_code,
                },
              ],
            }
          : undefined,
        who: buildReference(
          "Practitioner",
          await resolveFhirId(db, tenantId, sourceSystem, "Practitioner", data.agent_who_id),
        ),
      },
    ],
  };
}

module.exports = mapProvenance;
