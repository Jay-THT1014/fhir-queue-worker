const logger = require("../utils/logger");

const VALIDATOR_URL = process.env.VALIDATOR_URL || "http://localhost:8080/validate";

class FHIRValidator {
  /**
   * Validates a FHIR resource against the local HL7 Java Validator HTTP Server.
   * Separates VALID and INVALID results, and strips PHI from error logs.
   *
   * @param {Object} resource The FHIR resource to validate
   * @returns {Object} The OperationOutcome if successful, or throws a sanitized Error
   */
  static async validate(resource) {
    try {
      // Import node-fetch dynamically if running in an older Node version without native fetch
      const fetchApi = typeof fetch !== "undefined" ? fetch : require("node-fetch");

      const response = await fetchApi(VALIDATOR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resource),
      });

      if (!response.ok) {
        throw new Error(`Validator Server returned HTTP ${response.status}`);
      }

      const validationResult = await response.json();

      // Handle VALID vs INVALID
      if (validationResult && validationResult.issue) {
        const errors = validationResult.issue.filter((i) => i.severity === "fatal" || i.severity === "error");

        if (errors.length > 0) {
          // Map to a sanitized array stripping away raw 'diagnostics'
          // which often contains snippets of the original JSON (PHI risk).
          const sanitizedErrors = errors.map((err) => ({
            severity: err.severity,
            code: err.code,
            expression: err.expression || [], // e.g. ['Patient.birthDate']
          }));

          throw new Error(`FHIR Validation Failed: ${JSON.stringify(sanitizedErrors)}`);
        }
      }

      return validationResult;
    } catch (error) {
      // Re-throw safely so the queue catches the sanitized failure
      logger.error(`Validation Process Error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = FHIRValidator;
