// Opportunity score (0–100): how much a web agency could improve this
// business online. Every point comes with a human-readable reason.

function scoreAudit(audit) {
  const issues = [];
  const add = (key, label, points) => issues.push({ key, label, points });

  if (!audit || !audit.hasWebsite) {
    add('no_website', 'No website', 95);
  } else if (!audit.reachable) {
    add('down', 'Website is down or unreachable', 90);
  } else {
    if (!audit.mobileFriendly) add('not_mobile', 'Not mobile-friendly', 20);
    if (!audit.https) add('no_https', 'No HTTPS (browsers show “Not secure”)', 15);
    if (audit.responseMs > 3000) add('slow', `Slow to load (${(audit.responseMs / 1000).toFixed(1)}s)`, 15);
    else if (audit.responseMs > 1500) add('slowish', `Could load faster (${(audit.responseMs / 1000).toFixed(1)}s)`, 8);
    if (audit.outdatedSignals?.length) add('outdated', `Outdated design signals: ${audit.outdatedSignals.slice(0, 2).join(', ')}`, 15);
    if (audit.thirdPartyBookingOnly) add('ota_only', 'Relies on Booking.com / Airbnb instead of direct bookings', 12);
    else if (!audit.hasBooking) add('no_booking', 'No online booking or clear call-to-action', 12);
    if (!audit.hasMetaDescription) add('no_meta', 'Missing SEO meta description', 5);
    if (!audit.title) add('no_title', 'Missing page title', 5);
    if (!audit.hasContactForm && !audit.emails?.length) add('no_contact', 'No contact form or visible email', 5);
  }

  const score = Math.min(100, issues.reduce((s, i) => s + i.points, 0));
  const level = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'low';
  return { score, level, issues: issues.sort((a, b) => b.points - a.points) };
}

module.exports = { scoreAudit };
