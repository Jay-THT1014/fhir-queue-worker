jest.mock("bullmq");
jest.mock("../config/db", () => ({ query: jest.fn() }));

let mockSearch = jest.fn();
let mockCreate = jest.fn();
let mockUpdate = jest.fn();

jest.mock("@medplum/core", () => ({
  MedplumClient: jest.fn(() => ({
    searchResources: mockSearch,
    createResource: mockCreate,
    updateResource: mockUpdate,
    startClientLogin: jest.fn().mockResolvedValue(),
  })),
}));

jest.mock("../services/ehrFetcherService");

const { Worker } = require("bullmq");
const db = require("../config/db");
const { fetchSourceData } = require("../services/ehrFetcherService");

global.fetch = jest.fn();

describe("End-to-End Sync Pipeline", () => {
  let processJob;

  beforeAll(() => {
    require("../queue/consumer");
    processJob = Worker.mock.calls[0][1];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Simulate EHR Event -> API -> Queue -> Worker -> Medplum", async () => {
    // 1. Mock EHR payload
    fetchSourceData.mockResolvedValueOnce({
      id: 555,
      firstName: "Integration",
      lastName: "Test",
      dob: "1990-01-01",
      gender: "M",
    });

    // 2. Mock FHIR Validator returning VALID
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        resourceType: "OperationOutcome",
        issue: [{ severity: "information" }],
      }),
    });

    // 3. Mock Medplum Idle Search & Create
    mockSearch.mockResolvedValueOnce([]);
    mockCreate.mockResolvedValueOnce({ id: "medplum-integration-id", resourceType: "Patient" });

    // 4. Mock DB
    db.query.mockResolvedValue();

    // 5. Trigger Worker Processing (Simulating BullMQ passing the job)
    const mockJob = {
      data: { jobId: "int-uuid", sourceSystem: "ehr", tenantId: "default", resourceType: "Patient", sourceId: "555" },
      attemptsMade: 1,
      opts: { attempts: 4 },
    };

    const result = await processJob(mockJob);

    // 6. Assertions
    expect(result.success).toBe(true);
    expect(result.syncedId).toBe("medplum-integration-id");

    // Check DB was updated perfectly
    expect(db.query).toHaveBeenCalledTimes(3);

    // Step 1: Mark ACTIVE
    expect(db.query.mock.calls[0][0]).toContain("UPDATE fhir_sync_job SET status = 'ACTIVE'");

    // Step 2: Record Mapping
    expect(db.query.mock.calls[1][0]).toContain("INSERT INTO fhir_resource_mapping");
    expect(db.query.mock.calls[1][1]).toEqual(["default", "ehr", "Patient", "555", "medplum-integration-id"]);

    // Step 3: Mark COMPLETED
    expect(db.query.mock.calls[2][0]).toContain("UPDATE fhir_sync_job SET status = 'COMPLETED'");
    expect(db.query.mock.calls[2][1]).toEqual(["int-uuid"]);
  });
});
