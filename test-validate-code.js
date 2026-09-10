const { MedplumClient } = require("@medplum/core");
const fetch = require("node-fetch");
require("dotenv").config();

const medplum = new MedplumClient({
  baseUrl: process.env.MEDPLUM_BASE_URL || "http://localhost:8103/",
  fetch: fetch,
});

async function run() {
  await medplum.startClientLogin(process.env.MEDPLUM_CLIENT_ID, process.env.MEDPLUM_CLIENT_SECRET);
  console.log("Logged in");

  const parameters = {
    resourceType: 'Parameters',
    parameter: [
      { name: 'url', valueUri: 'http://hl7.org/fhir/ValueSet/administrative-gender' },
      { name: 'code', valueCode: 'male' }
    ]
  };

  try {
    const res = await medplum.post('fhir/R4/ValueSet/$validate-code', parameters);
    console.log("Validation Result:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Validation Error:", err.message);
  }
}

run();
