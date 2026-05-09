import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — MBN DEV',
  description: 'How MBN DEV collects, uses, and protects your personal information.',
};

const LAST_UPDATED = 'May 7, 2026';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Who We Are</h2>
            <p>
              MBN DEV (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a Moroccan web development platform operated by Mounir Banni.
              We build custom websites, web applications, e-commerce stores, and digital solutions for businesses worldwide.
            </p>
            <p className="mt-2">
              Contact: <a href="tel:+212705914424" className="text-primary-400 hover:text-primary-300">+212 705 914 424</a>
              {' '}— <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">WhatsApp</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p>We collect information you voluntarily provide when you:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Create an account (name, email address, company, phone)</li>
              <li>Submit a project request (project details, requirements, budget)</li>
              <li>Make a payment (we never store card data — payments are made via direct bank transfer, PayPal, or TapTapSend)</li>
              <li>Send messages through the platform</li>
              <li>Upload project files</li>
            </ul>
            <p className="mt-3">We also automatically collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Usage data (pages visited, features used)</li>
              <li>Device and browser information</li>
              <li>IP address (for security and fraud prevention)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p>Your data is used to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Create and manage your account</li>
              <li>Deliver the services you request</li>
              <li>Process payments and generate invoices</li>
              <li>Communicate with you about your projects</li>
              <li>Send notifications about project updates</li>
              <li>Improve our platform and services</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">We do <strong className="text-white">not</strong> sell, rent, or trade your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage & Security</h2>
            <p>
              Your data is stored on Neon PostgreSQL — a secure, encrypted cloud database hosted on AWS infrastructure.
              All data transmission uses TLS/HTTPS encryption. Passwords are hashed using bcrypt.
              Payments are processed via PayPal, CIH Bank, or TapTapSend — we do not handle card data ourselves.
            </p>
            <p className="mt-2">
              We implement reasonable technical and organizational measures to protect your data, but no system is 100% secure.
              We will notify you promptly if a data breach occurs that affects your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Cookies</h2>
            <p>
              We use minimal, essential cookies required for authentication (JWT tokens stored in localStorage).
              We do not use advertising cookies or third-party tracking cookies.
              You can clear your browser&apos;s localStorage at any time to remove stored session data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data via your account settings</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{' '}
              <a href="https://wa.me/212705914424" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                WhatsApp +212 705 914 424
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active or as needed to provide services.
              When you request account deletion, we delete your personal data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li><strong className="text-slate-300">PayPal</strong> — Payment processing (when used; see PayPal&apos;s Privacy Policy)</li>
              <li><strong className="text-slate-300">Resend</strong> — Transactional email delivery</li>
              <li><strong className="text-slate-300">Neon</strong> — Database hosting</li>
              <li><strong className="text-slate-300">Vercel</strong> — Frontend hosting and CDN</li>
            </ul>
            <p className="mt-2">Each service is governed by their own privacy policies and security standards.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of significant changes
              via email or platform notification. Continued use of MBN DEV after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>
              Questions about this Privacy Policy? Contact us:
            </p>
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
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
