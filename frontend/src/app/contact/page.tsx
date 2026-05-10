'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight, Zap, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '@/components/landing/PublicLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  // Data arrays inside component so labels re-evaluate on locale change
  const contactInfo = [
    { icon: Mail,    label: t('contact.info.email'),    value: 'hello@mbndev.com',                     href: 'mailto:hello@mbndev.com'   },
    { icon: Phone,   label: t('contact.info.whatsapp'), value: t('contact.info.whatsappVal'),           href: 'https://wa.me/212705914424' },
    { icon: MapPin,  label: t('contact.info.location'), value: t('contact.info.locationVal'),           href: null                        },
    { icon: Clock,   label: t('contact.info.response'), value: t('contact.info.responseVal'),           href: null                        },
  ];

  const faqs = [
    { q: 'How long does a project take?',          a: 'Depending on scope: landing pages 3–7 days, full websites 2–4 weeks, SaaS applications 4–8 weeks.' },
    { q: 'Do you work with international clients?', a: 'Yes! I work with clients globally. Communication is in English and French.' },
    { q: 'What payment methods do you accept?',    a: 'Stripe, PayPal, wire transfer, and local Moroccan bank transfer.' },
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
    const text = encodeURIComponent(
      `Hi Mounir, I'm ${form.name} (${form.email}).\n\n${subject}${form.message}`
    );
    window.open(`https://wa.me/212705914424?text=${text}`, '_blank');
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 mb-6">
              <Zap className="w-3 h-3 text-primary-400" /> {t('contact.badge')}
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-slate-400 max-w-xl mx-auto">
              {t('contact.sub')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="glass rounded-2xl p-6 border border-white/5 mb-6">
              <h2 className="text-white font-bold text-lg mb-5">{t('contact.details')}</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-primary-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary-400" />
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs mb-0.5">{item.label}</div>
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

            {/* Quick links */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-semibold text-sm mb-4">{t('contact.quickActions')}</h3>
              <div className="space-y-2">
                <a
                  href="https://wa.me/212705914424?text=Hi%20Mounir,%20I'd%20like%20to%20discuss%20a%20project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl hover:border-green-500/40 transition-colors group"
                >
                  <MessageCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-green-400 text-sm font-medium">{t('contact.chatWhatsApp')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-green-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="mailto:hello@mbndev.com"
                  className="flex items-center gap-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl hover:border-primary-500/40 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                  <span className="text-primary-400 text-sm font-medium">{t('contact.sendEmail')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-2xl p-8 border border-white/5">
              <h2 className="text-white font-bold text-lg mb-6">{t('contact.sendForm')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={`${t('contact.form.name')} *`} placeholder={t('contact.form.namePh')} value={form.name} onChange={set('name')} required />
                  <Input label={`${t('contact.form.email')} *`} type="email" placeholder={t('auth.placeholder.email')} value={form.email} onChange={set('email')} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('contact.form.subject')}</label>
                  <select
                    value={form.subject}
                    onChange={set('subject')}
                    className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
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
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('contact.form.message')} *</label>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    rows={6}
                    placeholder={t('contact.form.messagePh')}
                    className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 resize-none transition-colors"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full group">
                  {t('contact.sendWhatsApp')} <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-slate-600 text-center">
                  {t('contact.whatsAppNote')}
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">{t('contact.faqTitle')}</h2>
            <p className="text-slate-400">{t('contact.faqSub')}</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-xl p-5 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm mb-1">{faq.q}</div>
                    <div className="text-slate-400 text-sm">{faq.a}</div>
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
