/**
 * constants.js — Application-wide enum/domain constants.
 */

// ─── Indent ───────────────────────────────────────────────────────────────────

const INDENT_PRIORITIES = ["low", "normal", "high", "urgent", "critical"];

const INDENT_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "partially_approved",
  "rejected",
  "po_created",
  "partially_po_created",
  "grn_created",
  "partially_received",
  "completed",
  "fulfilled",
  "cancelled",
];

const INDENT_ITEM_STATUSES = [
  "pending",
  "approved",
  "partially_approved",
  "rejected",
  "po_raised",
  "partially_po_raised",
  "fulfilled",
];

const STOCK_ISSUE_APPROVAL_STATUSES = [
  "Pending",
  "Approved",
  "Partially Approved",
  "Rejected",
  "Issued",
  "Partially Issued",
  "Received",
  "Partially Received",
];

const STOCK_ISSUE_LINE_STATUSES = [
  "Pending",
  "Approved",
  "Partially Approved",
  "Rejected",
  "Issued",
  "Partially Issued",
  "Received",
  "Partially Received",
];

// ─── Inventory ────────────────────────────────────────────────────────────────

const ITEM_STATUSES = ["Active", "Inactive", "Discontinued", "On Hold"];

// ─── Purchase Order ──────────────────────────────────────────────────────────

const PO_PRIORITIES = ["low", "normal", "high", "urgent", "critical"];

const PO_STATUSES = [
  "draft",
  "submitted",
  "partially_approved",
  "approved",
  "sent_to_supplier",
  "partially_received",
  "received",
  "cancelled",
  "closed",
  "rejected",
];

// ─── GRN ──────────────────────────────────────────────────────────────────────

const GRN_CONDITIONS = {
  GOOD: "Good - No Issues",
  SHORT_CLOSE: "Short Close",
  DAMAGED: "Damaged",
  EXPIRED: "Expired",
  EXPIRY: "Expiry",
  COLD_CHAIN_BREACH: "Cold Chain Breach",
  WRONG_ITEM: "Wrong Item",
};

const DISCREPANCY_CONDITIONS = [
  GRN_CONDITIONS.DAMAGED,
  GRN_CONDITIONS.EXPIRED,
  GRN_CONDITIONS.EXPIRY,
  GRN_CONDITIONS.COLD_CHAIN_BREACH,
  GRN_CONDITIONS.WRONG_ITEM,
];

const ROLES = {
  STORE_MANAGER: "store_manager",
  LOCATION_MANAGER: "location_manager",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  NURSE_WARD_STAFF: "nurse_ward_staff",
  PROCUREMENT_USER: "procurement_user",
  DEPARTMENT_APPROVER: "department_approver",
};

module.exports = {
  INDENT_PRIORITIES,
  INDENT_STATUSES,
  INDENT_ITEM_STATUSES,
  STOCK_ISSUE_APPROVAL_STATUSES,
  STOCK_ISSUE_LINE_STATUSES,
  ITEM_STATUSES,
  PO_PRIORITIES,
  PO_STATUSES,
  GRN_CONDITIONS,
  DISCREPANCY_CONDITIONS,
  ROLES,
};
