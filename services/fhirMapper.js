const logger = require("../utils/logger");

const mapPatient = require("./mappers/PatientMapper");
const mapEncounter = require("./mappers/EncounterMapper");
const mapPractitioner = require("./mappers/PractitionerMapper");
const mapOrganization = require("./mappers/OrganizationMapper");
const mapLocation = require("./mappers/LocationMapper");
const mapCondition = require("./mappers/ConditionMapper");
const mapObservation = require("./mappers/ObservationMapper");
const mapAllergyIntolerance = require("./mappers/AllergyIntoleranceMapper");
const mapImmunization = require("./mappers/ImmunizationMapper");
const mapMedication = require("./mappers/MedicationMapper");
const mapFamilyMemberHistory = require("./mappers/FamilyMemberHistoryMapper");
const mapProcedure = require("./mappers/ProcedureMapper");
const mapPractitionerRole = require("./mappers/PractitionerRoleMapper");
const mapCarePlan = require("./mappers/CarePlanMapper");
const mapCareTeam = require("./mappers/CareTeamMapper");
const mapCoverage = require("./mappers/CoverageMapper");
const mapDevice = require("./mappers/DeviceMapper");
const mapDiagnosticReport = require("./mappers/DiagnosticReportMapper");
const mapDocumentReference = require("./mappers/DocumentReferenceMapper");
const mapGoal = require("./mappers/GoalMapper");
const mapMedicationDispense = require("./mappers/MedicationDispenseMapper");
const mapMedicationRequest = require("./mappers/MedicationRequestMapper");
const mapProvenance = require("./mappers/ProvenanceMapper");
const mapQuestionnaireResponse = require("./mappers/QuestionnaireResponseMapper");
const mapRelatedPerson = require("./mappers/RelatedPersonMapper");
const mapServiceRequest = require("./mappers/ServiceRequestMapper");
const mapSpecimen = require("./mappers/SpecimenMapper");

async function mapToFhir(resourceType, sourceData, sourceSystem, orgId, tenantId, db) {
  logger.info(`Mapping raw ${resourceType} to FHIR R4 format...`);

  switch (resourceType.toLowerCase()) {
    case "patient":
      return await mapPatient(sourceData, sourceSystem, orgId, tenantId, db);
    case "encounter":
      return await mapEncounter(sourceData, sourceSystem, orgId, tenantId, db);
    case "practitioner":
      return await mapPractitioner(sourceData, sourceSystem, orgId, tenantId, db);
    case "organization":
      return await mapOrganization(sourceData, sourceSystem, orgId, tenantId, db);
    case "location":
      return await mapLocation(sourceData, sourceSystem, orgId, tenantId, db);
    case "condition":
      return await mapCondition(sourceData, sourceSystem, orgId, tenantId, db);
    case "observation":
      return await mapObservation(sourceData, sourceSystem, orgId, tenantId, db);
    case "allergyintolerance":
      return await mapAllergyIntolerance(sourceData, sourceSystem, orgId, tenantId, db);
    case "immunization":
      return await mapImmunization(sourceData, sourceSystem, orgId, tenantId, db);
    case "medication":
      return await mapMedication(sourceData, sourceSystem, orgId, tenantId, db);
    case "familymemberhistory":
      return await mapFamilyMemberHistory(sourceData, sourceSystem, orgId, tenantId, db);
    case "procedure":
      return await mapProcedure(sourceData, sourceSystem, orgId, tenantId, db);
    case "practitionerrole":
      return await mapPractitionerRole(sourceData, sourceSystem, orgId, tenantId, db);
    case "careplan":
      return await mapCarePlan(sourceData, sourceSystem, orgId, tenantId, db);
    case "careteam":
      return await mapCareTeam(sourceData, sourceSystem, orgId, tenantId, db);
    case "coverage":
      return await mapCoverage(sourceData, sourceSystem, orgId, tenantId, db);
    case "device":
      return await mapDevice(sourceData, sourceSystem, orgId, tenantId, db);
    case "diagnosticreport":
      return await mapDiagnosticReport(sourceData, sourceSystem, orgId, tenantId, db);
    case "documentreference":
      return await mapDocumentReference(sourceData, sourceSystem, orgId, tenantId, db);
    case "goal":
      return await mapGoal(sourceData, sourceSystem, orgId, tenantId, db);
    case "medicationdispense":
      return await mapMedicationDispense(sourceData, sourceSystem, orgId, tenantId, db);
    case "medicationrequest":
      return await mapMedicationRequest(sourceData, sourceSystem, orgId, tenantId, db);
    case "provenance":
      return await mapProvenance(sourceData, sourceSystem, orgId, tenantId, db);
    case "questionnaireresponse":
      return await mapQuestionnaireResponse(sourceData, sourceSystem, orgId, tenantId, db);
    case "relatedperson":
      return await mapRelatedPerson(sourceData, sourceSystem, orgId, tenantId, db);
    case "servicerequest":
      return await mapServiceRequest(sourceData, sourceSystem, orgId, tenantId, db);
    case "specimen":
      return await mapSpecimen(sourceData, sourceSystem, orgId, tenantId, db);
    default:
      throw new Error(`FHIR Mapper: Unsupported resourceType '${resourceType}'`);
  }
}

module.exports = {
  mapToFhir,
};
