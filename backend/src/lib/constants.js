// ─── Shared platform constants ────────────────────────────────────────────────
// Single source of truth for roles, statuses, and error codes.
// Import from here — never hard-code these strings in controllers/middleware.

// ─── User roles ───────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  ADMIN:  'admin',
  CLIENT: 'client',
});

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS = Object.freeze({
  STARTER: 'starter',
  PRO:     'pro',
  PREMIUM: 'premium',
  CUSTOM:  'custom',
});

// ─── Project statuses ─────────────────────────────────────────────────────────
const PROJECT_STATUS = Object.freeze({
  PENDING:     'pending',
  PAID:        'paid',
  IN_PROGRESS: 'in-progress',
  REVIEW:      'review',
  REVISION:    'revision',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
});

// ─── Order statuses ───────────────────────────────────────────────────────────
const ORDER_STATUS = Object.freeze({
  PENDING:   'pending',
  PAID:      'paid',
  CANCELLED: 'cancelled',
});

// ─── Payment statuses ─────────────────────────────────────────────────────────
const PAYMENT_STATUS = Object.freeze({
  PENDING:              'pending',
  PENDING_VERIFICATION: 'pending_verification',
  PAID:                 'paid',
  FAILED:               'failed',
  REFUNDED:             'refunded',
});

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHOD = Object.freeze({
  CIH_BANK:   'cih_bank',
  PAYPAL:     'paypal',
  TAPTAPSEND: 'taptapsend',
  MOCK:       'mock',
});

// ─── Milestone statuses ───────────────────────────────────────────────────────
const MILESTONE_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID:    'paid',
});

// ─── Message types ────────────────────────────────────────────────────────────
const MESSAGE_TYPE = Object.freeze({
  USER:   'user',
  SYSTEM: 'system',
});

// ─── Auth error codes ─────────────────────────────────────────────────────────
const AUTH_ERROR = Object.freeze({
  EMAIL_TAKEN:         'EMAIL_TAKEN',
  PHONE_TAKEN:         'PHONE_TAKEN',
  INVALID_PHONE:       'INVALID_PHONE',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  ACCOUNT_LOCKED:      'ACCOUNT_LOCKED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  RATE_LIMITED:        'RATE_LIMITED',
});

// ─── Activity log actions ─────────────────────────────────────────────────────
const ACTIVITY_ACTION = Object.freeze({
  STATUS_CHANGE:       'status_change',
  FILE_UPLOAD:         'file_upload',
  MESSAGE_SENT:        'message_sent',
  PAYMENT_RECEIVED:    'payment_received',
  MILESTONE_UPDATED:   'milestone_updated',
  REVISION_REQUESTED:  'revision_requested',
  PROJECT_DELIVERED:   'project_delivered',
});

// ─── Notification types ───────────────────────────────────────────────────────
const NOTIFICATION_TYPE = Object.freeze({
  ORDER_PLACED:       'order_placed',
  PAYMENT_RECEIVED:   'payment_received',
  PROJECT_CREATED:    'project_created',
  STATUS_UPDATE:      'status_update',
  NEW_MESSAGE:        'new_message',
  REVISION_REQUEST:   'revision_request',
  PROJECT_DELIVERED:  'project_delivered',
});

module.exports = {
  ROLES,
  PLANS,
  PROJECT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  MILESTONE_STATUS,
  MESSAGE_TYPE,
  AUTH_ERROR,
  ACTIVITY_ACTION,
  NOTIFICATION_TYPE,
};
