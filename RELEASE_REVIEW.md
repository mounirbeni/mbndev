# MBN DEV — release review for commercial-trust fixes

This is a **review checklist**, not a certification, test report or assertion of regulatory compliance. Do not merge this PR solely because a Vercel preview says READY.

## Must complete before production

- [ ] Investigate GitHub Actions CI. Backend and frontend jobs failed on the baseline and on this PR; the connector returned no usable steps/logs. Re-run the actual lint, unit, integration and frontend build suites with logs in a controlled environment. Keep production untouched until these pass.
- [ ] Verify the home, services, service-detail, pricing, portfolio and about routes on desktop and mobile, including real API responses and navigation.
- [ ] Test public package price against authoritative server checkout for Starter, Pro and Premium, with extra pages, features and rush delivery. Admin edits to a standard package price should be rejected rather than creating mismatched quotes.
- [ ] Test an unauthenticated visitor choosing a package, sign-up/sign-in, order submission, manual payment verification and client dashboard. Use test accounts and test payments only; never submit real funds for a smoke test.
- [ ] Verify the hosting, DNS, emails, domains, analytics, tracking/cookie configuration and payment processors actually used in production. Update the privacy notice to match those facts.
- [ ] Have the owner and a qualified Moroccan legal reviewer approve the proposed Terms and Privacy pages, including refund/withdrawal cases, personal-data notices, CNDP obligations, overseas processing and applicable retention periods. These are drafts, not legal certification.
- [ ] Audit all portfolio links and project descriptions for ownership, correct destinations, current availability and permission before attributing work to a customer. Add testimonials, client totals and performance figures only after supporting evidence and consent.
- [ ] Review any external promise of a fixed turnaround, guaranteed response, free consultations, discounts, end-to-end encryption or unlimited scope before publishing it.
- [ ] **Urgent security action:** if the historical seed script was ever run, assume its previously published fixed admin password is exposed. Rotate the real administrator credentials, revoke sessions where appropriate and review access logs. Removing the credentials from current files does not erase Git history or rotate an existing account.
- [ ] Verify backups/restore procedures and ensure production seeding is never attempted. The new seed is additive and refuses NODE_ENV=production; it does not migrate or alter live data by itself.

## Scope of this PR

Marketing price display, package comparison, SEO metadata, public marketing copy, portfolio/about/service pages, draft legal wording, safer local seeding, documentation and a pricing regression test.

Not performed: production deployment, edits to live client records, real payment transactions, manual password rotation, domain/email provider changes, confirmation of all portfolio websites, independent legal advice, a successful end-to-end CI run or a full application penetration test.
