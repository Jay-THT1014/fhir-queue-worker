const FHIRValidator = require("../services/validatorService");

// Mock global fetch
global.fetch = jest.fn();

describe("FHIR Validator Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns successfully when outcome is all OK", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        resourceType: "OperationOutcome",
        issue: [{ severity: "information", code: "informational" }],
      }),
    });

    await expect(FHIRValidator.validate({ resourceType: "Patient" })).resolves.not.toThrow();
  });

  test("throws error and sanitizes diagnostics when outcome is fatal", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        resourceType: "OperationOutcome",
        issue: [{ severity: "fatal", code: "invalid", expression: [] }],
      }),
    });

    await expect(FHIRValidator.validate({ resourceType: "Patient" })).rejects.toThrow(
      'FHIR Validation Failed: [{"severity":"fatal","code":"invalid","expression":[]}]',
    );
  });
});
