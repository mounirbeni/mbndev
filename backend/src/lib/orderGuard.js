'use strict';

/**
 * orderGuard.js
 *
 * Explicit state machine for Order.status, mirroring paymentGuard.js.
 * Any transition NOT listed here is illegal and throws a 409.
 *
 *   pending   → paid | cancelled
 *   paid      → (terminal — a project now owns the lifecycle)
 *   cancelled → (terminal)
 */
const VALID_TRANSITIONS = {
  pending:   new Set(['paid', 'cancelled']),
  paid:      new Set([]),
  cancelled: new Set([]),
};

/** Active (non-terminal) payment states — an order with one of these attached
 *  must not be edited, cancelled, or deleted out from under it. */
const ACTIVE_PAYMENT_STATUSES = ['pending_verification', 'processing'];

function assertOrderTransition(from, to) {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) {
    const err = new Error(`Unknown order status "${from}"`);
    err.statusCode = 500;
    throw err;
  }
  if (!allowed.has(to)) {
    const err = new Error(`Illegal order transition: ${from} → ${to}`);
    err.statusCode = 409;
    err.code = 'INVALID_TRANSITION';
    throw err;
  }
}

module.exports = { VALID_TRANSITIONS, ACTIVE_PAYMENT_STATUSES, assertOrderTransition };
