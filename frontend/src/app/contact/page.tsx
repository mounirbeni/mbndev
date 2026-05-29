'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, MessageCircle, ArrowRight, Zap, Clock, CheckCircle2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLanguage } from '@/contexts/LanguageContext';

const cardStyle = {
  background:    'rgba(10,10,16,0.88)',
  border:        '1px solid rgba(255,255,255,0.07)',
  backdropFilter:'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow:     '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.35)',
};

const inputCls = [
  'w-full rounded-xl px-4 py-3 text-sm text-slate-200',
  'placeholder:text-slate-600 focus:outline-none transition-all duration-200',
  'border focus:ring-0',
].join(' ');

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [focusField, setFocusField] = useState<string | null>(null);

  const contactInfo = [
    { icon: Mail,    label: t('contact.info.email'),    value: 'contact@mbndev.ma',           href: 'mailto:contact@mbndev.ma'   },
    { icon: Phone,   label: t('contact.info.whatsapp'), value: t('contact.info.whatsappVal'), href: 'https://wa.me/212705914424' },
    { icon: MapPin,  label: t('contact.info.location'), value: t('contact.info.locationVal'), href: null                        },
    { icon: Clock,   label: t('contact.info.response'), value: t('contact.info.responseVal'), href: null                        },
  ];

  const faqs = [
    { q: 'How long does a project take?',          a: 'Depending on scope: landing pages 3–7 days, full websites 2–4 weeks, SaaS applications 4–8 weeks.' },
    { q: 'Do you work with international clients?', a: 'Yes! I work with clients globally. Communication is in English and Arabic.' },
    { q: 'What payment methods do you accept?',    a: 'PayPal, bank transfer, TapTapSend, and local Moroccan bank transfer.' },
    { q: 'Do you offer revisions?',                a: 'Yes. All packages include revision rounds. The number depends on your selected package.' },
  ];

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t('contact.toast.required'));
      return;
    }
    const subject = form.subject ? `[${form.subject}] ` : '';
    const text = encodeURIComponent(`Hi Mounir, I'm ${form.name} (${form.email}).\n\n${subject}${form.message}`);
    window.open(`https://wa.me/212705914424?text=${text}`, '_blank');
  };

  const fieldStyle = (field: string) => ({
    background:   focusField === field ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.03)',
    borderColor:  focusField === field ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.08)',
    boxShadow:    focusField === field ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
  });

  return (
    <PublicLayout>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 ambient-grid opacity-20 pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <span className="section-label mb-6">{t('contact.badge')}</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight leading-[1.06] mt-6">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              {t('contact.sub')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6 lg:gap-8">

          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Contact details card */}
            <div className="rounded-2xl p-6 relative overflow-hidden" style={cardStyle}>
              {/* Top glow line */}
              <div className="absolute top-0 left-6 right-6 h-px rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />

              <h2 className="text-white font-bold text-base mb-5">{t('contact.details')}</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
                      >
                        <Icon className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <div className="text-slate-600 text-[11px] uppercase tracking-wider mb-0.5">{item.label}</div>
                        <div className="text-white text-sm font-medium">{item.value}</div>
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                      className="block hover:opacity-80 transition-opacity">
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions card */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-white font-semibold text-sm mb-4">{t('contact.quickActions')}</h3>
              <div className="space-y-2.5">
                <a
                  href="https://wa.me/212705914424?text=Hi%20Mounir,%20I'd%20like%20to%20discuss%20a%20project"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.18)')}
                >
                  <MessageCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-green-400 text-sm font-medium flex-1">{t('contact.chatWhatsApp')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-green-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
                <a
                  href="mailto:contact@mbndev.ma"
                  className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)')}
                >
                  <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="text-violet-400 text-sm font-medium flex-1">{t('contact.sendEmail')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-violet-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right: contact form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl p-6 sm:p-8 relative overflow-hidden" style={cardStyle}>
              {/* Top glow line */}
              <div className="absolute top-0 left-8 right-8 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(59,130,246,0.3), transparent)' }} />

              <h2 className="text-white font-bold text-base mb-6">{t('contact.sendForm')}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {t('contact.form.name')} *
                    </label>
                    <input
                      type="text"
                      placeholder={t('contact.form.namePh')}
                      value={form.name}
                      onChange={set('name')}
                      onFocus={() => setFocusField('name')}
                      onBlur={() => setFocusField(null)}
                      required
                      className={inputCls}
                      style={fieldStyle('name')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {t('contact.form.email')} *
                    </label>
                    <input
                      type="email"
                      placeholder={t('auth.placeholder.email')}
                      value={form.email}
                      onChange={set('email')}
                      onFocus={() => setFocusField('email')}
                      onBlur={() => setFocusField(null)}
                      required
                      className={inputCls}
                      style={fieldStyle('email')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <select
                    value={form.subject}
                    onChange={set('subject')}
                    onFocus={() => setFocusField('subject')}
                    onBlur={() => setFocusField(null)}
                    className={inputCls}
                    style={fieldStyle('subject')}
                  >
                    <option value="">{t('contact.subject.select')}</option>
                    <option value="new-project">{t('contact.subject.project')}</option>
                    <option value="pricing">{t('contact.subject.pricing')}</option>
                    <option value="support">{t('contact.subject.support')}</option>
                    <option value="partnership">{t('contact.subject.partner')}</option>
                    <option value="other">{t('contact.subject.other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {t('contact.form.message')} *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    onFocus={() => setFocusField('message')}
                    onBlur={() => setFocusField(null)}
                    rows={6}
                    placeholder={t('contact.form.messagePh')}
                    className={inputCls + ' resize-none'}
                    style={fieldStyle('message')}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow:  '0 6px 24px rgba(124,58,237,0.35)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 32px rgba(124,58,237,0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(124,58,237,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  {t('contact.sendWhatsApp')}
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                  {t('contact.whatsAppNote')}
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">{t('contact.faqTitle')}</h2>
            <p className="text-slate-500">{t('contact.faqSub')}</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl p-5 group"
                style={{
                  background: 'rgba(10,10,16,0.8)',
                  border:     '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(16px)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
                  >
                    <CheckCircle2 className="w-3 h-3 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm mb-1.5">{faq.q}</div>
                    <div className="text-slate-500 text-sm leading-relaxed">{faq.a}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
