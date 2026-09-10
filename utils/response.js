/**
 * response.js — Standardized HTTP response helpers.
 *
 * Centralizes the { success, message, data } envelope so that:
 *  - All controllers produce a consistent response shape.
 *  - Any future structural changes (e.g. adding a timestamp) are made once here.
 */

const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendCreated = (res, data, message = "Created successfully") => {
  sendSuccess(res, data, message, 201);
};

const sendNoContent = (res) => res.status(204).send();

module.exports = { sendSuccess, sendCreated, sendNoContent };
