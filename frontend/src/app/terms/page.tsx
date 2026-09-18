import type { Metadata } from 'next';
import { LegalPageNav } from '@/components/legal/LegalPageNav';
import { LegalPageFooter } from '@/components/legal/LegalPageFooter';

export const metadata: Metadata = {
  title: 'Terms of Service — MBN DEV',
  description: 'Terms for using the MBN DEV platform and requesting development services.',
};

// Owner/legal review is required before publishing changes to contractual
// terms, particularly refunds, withdrawal rights and intellectual property.
const LAST_UPDATED = 'September 18, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0d]">
      <LegalPageNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance and Scope</h2>
            <p>These terms govern use of the MBN DEV website and client portal. The specific development work, deliverables, revision allowance, price and schedule for each project are set out in the proposal accepted by both parties. Applicable mandatory legal rights are not excluded by these terms.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Our Services</h2>
            <p>MBN DEV offers website and web-application development. The platform supports project requests, progress updates, messages, payment-evidence submission and delivery files. Features and service availability may vary by project.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Accounts</h2>
            <p>Provide accurate account information, safeguard your credentials and tell us if you suspect unauthorized access. Accounts may be restricted for misuse, subject to applicable law and existing project obligations.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Orders, Pricing and Payment</h2>
            <p>Submitting a request starts the quotation process. Public package prices are displayed in USD where available; they do not replace an agreed project proposal. Any discounts, taxes, hosting, third-party services, payment milestones and quote-expiry period must be stated in the applicable written proposal.</p>
            <p className="mt-2">Payment methods may include CIH Bank, PayPal and TapTapSend, subject to availability. Submitted transfer or payment evidence is manually reviewed. Sending a receipt does not itself establish that funds have been received. A project starts on the schedule agreed after the required payment has been verified.</p>
            <h3 className="font-semibold text-white mt-4 mb-2">Refunds and cancellation requests</h3>
            <p>For work not yet started, you can submit a refund request within seven days of payment, as described in our prior policy. Refunds and any applicable withdrawal rights are handled under the accepted proposal and mandatory law. For work already started, the parties will review completed work, any paid milestones and the agreed cancellation terms. These terms do not impose a blanket rule that all payments or deposits are non-refundable.</p>
            <p className="mt-2">To raise a payment dispute, contact us at <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">WhatsApp +212 705 914 424</a>.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Schedule and Revisions</h2>
            <p>Delivery dates begin from the start date confirmed in the proposal and depend on timely receipt of agreed content, approvals and access. Any change in scope or schedule should be documented with the client. Included revision rounds are those stated in the accepted proposal; extra work requires a separate agreement before additional charges are incurred.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Deliverables and Intellectual Property</h2>
            <p>The proposal identifies which design files, source files, access credentials and other deliverables are included, and the rights to be transferred after applicable payment. Third-party assets, open-source libraries and separately licensed tools remain governed by their own licences. Do not assume every package includes source-code handover unless expressly included in the accepted scope.</p>
            <p className="mt-2">Publication of client work in our portfolio requires appropriate permission and must respect confidentiality and third-party rights.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Client Responsibilities</h2>
            <p>Provide lawful material, accurate requirements and timely decisions. Share credentials through an agreed secure channel rather than public messages; ensure that any content supplied is yours to use. Do not misuse the platform or interfere with other users' accounts.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Confidentiality and Privacy</h2>
            <p>Project information shared in confidence should be used only for the agreed work or as otherwise permitted by law. Please also review our <a href="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</a> for information about personal data processing.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Support and Third-Party Services</h2>
            <p>Hosting, domain registration, ongoing maintenance and third-party subscriptions are provided only when included in the agreed proposal or a separate support agreement. Their charges and renewal responsibilities should be identified before purchase.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Liability</h2>
            <p>Liability and remedies are subject to the applicable agreement and any rights that cannot lawfully be limited. Please discuss project-specific risks, backups, security and continuity requirements before work starts.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Ending a Project</h2>
            <p>Either party may request termination in writing. Settlement of completed work, any advance payment and the handover of materials is determined by the agreed project terms and applicable law; no blanket non-refundable-deposit rule applies under this page.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Governing Law and Changes</h2>
            <p>These terms are intended for a business operated in Morocco and are subject to applicable Moroccan law, including mandatory consumer protections where relevant. We will seek an amicable resolution of disputes before any formal proceedings. Updated terms will be dated, and material changes to an existing project require appropriate agreement rather than unilateral retroactive changes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">13. Contact</h2>
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <p><span className="text-slate-400">Platform:</span> <span className="text-white">MBN DEV</span></p>
              <p><span className="text-slate-400">Operator:</span> <span className="text-white">Mounir Banni</span></p>
              <p><span className="text-slate-400">Country:</span> <span className="text-white">Morocco</span></p>
              <p><span className="text-slate-400">Phone / WhatsApp:</span> <a href="tel:+212705914424" className="text-primary-400 hover:text-primary-300">+212 705 914 424</a></p>
            </div>
          </section>
        </div>
        <LegalPageFooter />
      </div>
    </div>
  );
}
