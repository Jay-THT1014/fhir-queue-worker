const { Worker } = require("bullmq");
const logger = require("../utils/logger");
const db = require("../config/db");
const { fetchSourceData } = require("../services/ehrFetcherService");
const { mapToFhir } = require("../services/fhirMapper");
// const FHIRValidator = require("../services/validatorService");
const { authenticateMedplum, upsertResource } = require("../services/medplumService");

const QUEUE_NAME = "fhir-sync-queue";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6380;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "medplum";

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

authenticateMedplum().catch((err) => {
  logger.error("Failed to authenticate Medplum Client on startup. Jobs may fail to sync.");
});

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { jobId, sourceSystem, tenantId, resourceType, sourceId, orgId } = job.data;
    logger.info(`Processing job ${jobId}: Syncing ${sourceSystem} ${resourceType} [${sourceId}]`);

    try {
      await db.query(
        `UPDATE fhir_sync_job SET status = 'ACTIVE', attempt_count = attempt_count + 1, started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE job_uuid = $1`,
        [jobId],
      );

      logger.info(`Job ${jobId}: Retrieving raw source data...`);
      const rawData = job.data.payloadData || (await fetchSourceData(resourceType, sourceId));

      logger.info(`Job ${jobId}: Mapping raw data to FHIR...`);
      const mappedFhirResource = await mapToFhir(resourceType, rawData, sourceSystem, orgId, tenantId, db);

      logger.info(`Job ${jobId}: Skipping local validation...`);
      // await FHIRValidator.validate(mappedFhirResource);

      logger.info(`Job ${jobId}: Upserting to Medplum...`);
      const synced = await upsertResource(mappedFhirResource);

      await db.query(
        `INSERT INTO fhir_resource_mapping (tenant_id, source_system, resource_type, source_id, fhir_resource_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tenant_id, source_system, resource_type, source_id)
         DO UPDATE SET fhir_resource_id = EXCLUDED.fhir_resource_id, updated_at = CURRENT_TIMESTAMP`,
        [tenantId, sourceSystem, resourceType, sourceId, synced.id],
      );

      await db.query(
        `UPDATE fhir_sync_job SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE job_uuid = $1`,
        [jobId],
      );

      logger.info(`Job ${jobId}: Completed successfully! Synced resource ID: ${synced.id}`);
      return { success: true, syncedId: synced.id };
    } catch (error) {
      const isFinalAttempt = job.attemptsMade >= job.opts.attempts;
      const newStatus = isFinalAttempt ? "FAILED" : "RETRYING";

      await db.query(
        `UPDATE fhir_sync_job SET status = $1, last_error = $2, updated_at = CURRENT_TIMESTAMP WHERE job_uuid = $3`,
        [newStatus, error.message, jobId],
      );

      throw error;
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} (Queue ID) marked as completed in Redis`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job.id} (Queue ID) failed with error: ${err.message}`);
});

module.exports = worker;
