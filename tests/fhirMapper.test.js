const { mapToFhir } = require("../services/fhirMapper");

describe("FHIR Mapper", () => {
  test("deterministically maps EHR Patient payload to FHIR R4", () => {
    const rawPatient = {
      id: 12345,
      first_name: "John",
      last_name: "Smith",
      dob: "1980-01-20",
      gender: "M",
    };

    const fhirResource = mapToFhir("Patient", rawPatient, "your-ehr");

    expect(fhirResource.resourceType).toBe("Patient");
    expect(fhirResource.identifier[0].system).toBe("http://your-ehr/patient");
    expect(fhirResource.identifier[0].value).toBe("12345");
    expect(fhirResource.name[0].family).toBe("Smith");
    expect(fhirResource.name[0].given[0]).toBe("John");
    expect(fhirResource.gender).toBe("male");
    expect(fhirResource.birthDate).toBe("1980-01-20");
  });

  test("throws error for unsupported resource types", () => {
    expect(() => {
      mapToFhir("UnknownType", {}, "ehr");
    }).toThrow("FHIR Mapper: Unsupported resourceType 'UnknownType'");
  });
});
