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

  const resource = {
    resourceType: "Patient",
    name: [{ given: ["Test"], family: "Validation" }]
  };

  try {
    const res = await medplum.validateResource(resource);
    console.log("Validation Result:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Validation Error:", err.message);
  }
}

run();
