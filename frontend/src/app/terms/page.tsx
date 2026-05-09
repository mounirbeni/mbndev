import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — MBN DEV',
  description: 'Terms and conditions governing use of the MBN DEV platform and services.',
};

const LAST_UPDATED = 'May 7, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0d]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">MBN DEV</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the MBN DEV platform (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our platform.
            </p>
            <p className="mt-2">
              These terms apply to all visitors, registered users, and clients of MBN DEV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              MBN DEV is a web development platform that enables clients to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Request custom websites, web apps, and digital solutions</li>
              <li>Track project progress in real-time</li>
              <li>Communicate directly with the developer</li>
              <li>Make secure payments for services</li>
              <li>Access deliverables and project files</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. User Accounts</h2>
            <p>To use the platform you must:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Be at least 18 years of age or have parental consent</li>
            </ul>
            <p className="mt-3">
              You are responsible for all activity that occurs under your account.
              MBN DEV reserves the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Project Orders & Payments</h2>
            <h3 className="text-white font-medium mb-2">4.1 Order Placement</h3>
            <p>
              When you submit a project order, you are making a formal request for services.
              Orders become binding once payment has been processed and confirmed.
            </p>
            <h3 className="text-white font-medium mt-4 mb-2">4.2 Pricing</h3>
            <p>
              All prices are displayed in USD. Quoted prices are valid for 30 days from the date of quotation.
              We reserve the right to revise pricing with reasonable notice.
            </p>
            <h3 className="text-white font-medium mt-4 mb-2">4.3 Payment</h3>
            <p>
              Payments are accepted via direct bank transfer (CIH Bank), PayPal, or TapTapSend. Each payment is
              manually verified before the project is activated. All payments are non-refundable unless otherwise
              agreed in writing, except where required by applicable law.
            </p>
            <h3 className="text-white font-medium mt-4 mb-2">4.4 Refunds</h3>
            <p>
              Refund requests must be submitted within 7 days of payment for work not yet started.
              No refunds are issued for completed or substantially completed work.
              Disputes are handled directly via{' '}
              <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                WhatsApp +212 705 914 424
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Deliverables & Intellectual Property</h2>
            <p>
              Upon full payment, you receive full ownership and rights to the final deliverables (website, application, source code)
              unless otherwise specified in a separate agreement.
            </p>
            <p className="mt-2">
              MBN DEV retains the right to display completed work in our portfolio unless you request otherwise in writing.
              Third-party assets (fonts, stock images, libraries) remain subject to their respective licenses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Client Responsibilities</h2>
            <p>As a client, you agree to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Provide accurate project requirements and feedback in a timely manner</li>
              <li>Supply necessary content, assets, and access credentials as needed</li>
              <li>Review and approve deliverables within agreed timeframes</li>
              <li>Not use the platform for any illegal or harmful purposes</li>
              <li>Not attempt to reverse-engineer, copy, or resell our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Revisions</h2>
            <p>
              The number of revision rounds is determined by your selected package or agreed scope.
              Revisions outside the agreed scope may incur additional charges.
              Revision requests must be submitted through the platform&apos;s messaging system.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Confidentiality</h2>
            <p>
              Both parties agree to keep confidential any sensitive business information shared during the project.
              This includes business strategies, proprietary data, and technical specifications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p>
              MBN DEV&apos;s total liability for any claim arising from these terms or the services provided shall not exceed
              the total amount paid by the client for the specific project in question.
            </p>
            <p className="mt-2">
              We are not liable for indirect, incidental, or consequential damages including loss of profits,
              data, or business opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Termination</h2>
            <p>
              Either party may terminate a project with written notice. Upon termination, you will be charged
              for work completed up to the termination date. Deposits are non-refundable.
            </p>
            <p className="mt-2">
              MBN DEV reserves the right to terminate access to the platform for violations of these terms,
              abusive behavior, or fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Kingdom of Morocco.
              Any disputes shall first be attempted to be resolved amicably.
              Failing that, disputes shall be subject to the jurisdiction of Moroccan courts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Changes to Terms</h2>
            <p>
              We may revise these Terms of Service at any time. Significant changes will be communicated
              via platform notification. Continued use of the platform after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">13. Contact</h2>
            <p>Questions or concerns? Reach us at:</p>
            <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/8 space-y-1">
              <p><span className="text-slate-400">Platform:</span> <span className="text-white">MBN DEV</span></p>
              <p><span className="text-slate-400">Founder:</span> <span className="text-white">Mounir Banni</span></p>
              <p><span className="text-slate-400">Country:</span> <span className="text-white">Morocco</span></p>
              <p>
                <span className="text-slate-400">Phone / WhatsApp:</span>{' '}
                <a href="tel:+212705914424" className="text-primary-400 hover:text-primary-300">+212 705 914 424</a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} MBN DEV. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
