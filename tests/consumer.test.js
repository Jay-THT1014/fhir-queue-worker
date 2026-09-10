jest.mock("bullmq");
jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../services/ehrFetcherService");
jest.mock("../services/validatorService");
jest.mock("../services/medplumService", () => ({
  authenticateMedplum: jest.fn().mockResolvedValue(),
  upsertResource: jest.fn(),
}));
jest.mock("../services/fhirMapper");

const { Worker } = require("bullmq");
const db = require("../config/db");
const { fetchSourceData } = require("../services/ehrFetcherService");
const { mapToFhir } = require("../services/fhirMapper");
const FHIRValidator = require("../services/validatorService");
const { upsertResource } = require("../services/medplumService");

describe("Queue Consumer (Worker)", () => {
  let processJob;

  beforeAll(() => {
    require("../queue/consumer");
    // Extract the processor function passed to Worker
    processJob = Worker.mock.calls[0][1];
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("processes job successfully and updates DB to COMPLETED", async () => {
    fetchSourceData.mockResolvedValueOnce({ id: "123" });
    mapToFhir.mockReturnValueOnce({ resourceType: "Patient" });
    FHIRValidator.validate.mockResolvedValueOnce();
    upsertResource.mockResolvedValueOnce({ id: "medplum-123" });
    db.query.mockResolvedValue();

    const job = {
      data: { jobId: "uuid-1", sourceSystem: "ehr", tenantId: "default", resourceType: "Patient", sourceId: "123" },
    };

    await expect(processJob(job)).resolves.toEqual({ success: true, syncedId: "medplum-123" });

    expect(db.query).toHaveBeenCalledTimes(3);
  });

  test("updates DB to RETRYING if attempts remain", async () => {
    fetchSourceData.mockRejectedValueOnce(new Error("Network Error"));
    db.query.mockResolvedValue();

    const job = {
      data: { jobId: "uuid-2", sourceSystem: "ehr", tenantId: "default", resourceType: "Patient", sourceId: "123" },
      attemptsMade: 1,
      opts: { attempts: 4 },
    };

    await expect(processJob(job)).rejects.toThrow("Network Error");

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[1][1]).toEqual(["RETRYING", "Network Error", "uuid-2"]);
  });

  test("updates DB to FAILED on final attempt exhaust", async () => {
    fetchSourceData.mockRejectedValueOnce(new Error("Network Error"));
    db.query.mockResolvedValue();

    const job = {
      data: { jobId: "uuid-3", sourceSystem: "ehr", tenantId: "default", resourceType: "Patient", sourceId: "123" },
      attemptsMade: 4,
      opts: { attempts: 4 },
    };

    await expect(processJob(job)).rejects.toThrow("Network Error");

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[1][1]).toEqual(["FAILED", "Network Error", "uuid-3"]);
  });
});
