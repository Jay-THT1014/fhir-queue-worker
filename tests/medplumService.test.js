let mockSearch = jest.fn();
let mockCreate = jest.fn();
let mockUpdate = jest.fn();

jest.mock("@medplum/core", () => ({
  MedplumClient: jest.fn(() => ({
    searchResources: mockSearch,
    createResource: mockCreate,
    updateResource: mockUpdate,
    startClientLogin: jest.fn(),
  })),
}));

const { upsertResource } = require("../services/medplumService");

describe("Medplum Service Idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("upsertResource updates if existing resource found", async () => {
    mockSearch.mockResolvedValueOnce([{ id: "existing-medplum-id", resourceType: "Patient" }]);
    mockUpdate.mockResolvedValueOnce({ id: "existing-medplum-id", resourceType: "Patient" });

    const resource = { resourceType: "Patient", identifier: [{ system: "sys", value: "val" }] };
    const result = await upsertResource(resource);

    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result.id).toBe("existing-medplum-id");
  });

  test("upsertResource creates if no existing resource found", async () => {
    mockSearch.mockResolvedValueOnce([]);
    mockCreate.mockResolvedValueOnce({ id: "new-medplum-id", resourceType: "Patient" });

    const resource = { resourceType: "Patient", identifier: [{ system: "sys", value: "val" }] };
    const result = await upsertResource(resource);

    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(result.id).toBe("new-medplum-id");
  });
});
