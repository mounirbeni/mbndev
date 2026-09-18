import type { Metadata } from 'next';
import { LegalPageNav } from '@/components/legal/LegalPageNav';
import { LegalPageFooter } from '@/components/legal/LegalPageFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy — MBN DEV',
  description: 'How MBN DEV handles account, project and communication information.',
};

// This policy describes the repository's documented implementation. The
// operator must review actual providers, retention and local legal duties
// before merging or publishing any policy changes.
const LAST_UPDATED = 'September 18, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0d]">
      <LegalPageNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Who We Are</h2>
            <p>MBN DEV is a Moroccan web development platform operated by Mounir Banni. We build websites, web applications and digital solutions for clients.</p>
            <p className="mt-2">Privacy questions: <a href="tel:+212705914424" className="text-primary-400 hover:text-primary-300">+212 705 914 424</a> or <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">WhatsApp</a>.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p>Depending on the services you use, this may include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Account information such as name, email, phone and company.</li>
              <li>Project requirements, budgets, messages and files you submit.</li>
              <li>Payment method, payment status and transaction evidence supplied for manual verification. Do not send full card details.</li>
              <li>Technical and security information such as IP address, browser and request logs.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Why We Use Information</h2>
            <p>We use this information to administer accounts, respond to enquiries, prepare and deliver projects, verify payments, provide project communications, maintain service security and meet applicable obligations.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Storage and Security</h2>
            <p>The platform uses a PostgreSQL database hosted with Neon and deploys application services through Vercel. Connections use HTTPS in normal production operation and account passwords are hashed. Project files may be stored through Vercel Blob when configured.</p>
            <p className="mt-2">We apply technical safeguards, but no online service can guarantee absolute security. Please avoid including sensitive credentials or full payment-card details in project messages or files.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Session Storage and Cookies</h2>
            <p>The application uses browser localStorage for an access token, an HTTP-only refresh cookie for session renewal and a role cookie to support navigation. These mechanisms help keep you signed in. Clearing browser site data or signing out affects your session.</p>
            <p className="mt-2">Other third-party services and embedded content may have their own storage practices. Review your browser settings and the relevant provider policies for details.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Your Requests</h2>
            <p>You can ask about the personal information associated with your account, request corrections or submit an account-deletion request. Some information may need to be retained for contractual, accounting, security or other applicable obligations.</p>
            <p className="mt-2">For requests, contact <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">WhatsApp +212 705 914 424</a>. We will review the request and explain the available steps.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Retention</h2>
            <p>Account, project, billing and security information is kept according to its operational purpose and any applicable retention obligations. An account-deletion request does not necessarily remove payment or audit records that must be retained. Contact us for information about your specific request.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Third-Party Services</h2>
            <p>Depending on the features you use and the production configuration, service providers may include:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li><strong className="text-slate-300">Neon</strong> — database hosting.</li>
              <li><strong className="text-slate-300">Vercel</strong> — application hosting and, when configured, uploaded-file storage.</li>
              <li><strong className="text-slate-300">Brevo</strong> — transactional emails when configured.</li>
              <li><strong className="text-slate-300">PayPal, CIH Bank and TapTapSend</strong> — payment channels when you choose to use them.</li>
            </ul>
            <p className="mt-2">These providers process information under their own applicable terms and privacy notices.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Policy Updates</h2>
            <p>We may update this notice to reflect changes in our services, providers or obligations. The date above identifies this version. Material changes may be communicated through the platform or email where appropriate.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
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
