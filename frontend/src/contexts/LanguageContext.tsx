'use client';

import React, { createContext, useContext } from 'react';
import { t as translate } from '@/lib/i18n/translations';

interface LanguageContextValue {
  t: (key: string, fallback?: string) => string;
}

// Conservative wording for older marketing keys that are shared by multiple
// pages. Do not present unverifiable market figures or service guarantees.
// Remove an override only after the owner verifies and approves the claim.
const verifiedCopy: Record<string, string> = {
  'pricing.subtitle': 'Choose a package to explore its scope. We confirm your price and delivery schedule in writing before development starts.',
  'pricing.marketAvg': 'Reference price',
  'pricing.youSave': 'Ask about current pricing',
  'portfolio.subtitle': 'Selected websites, concepts and digital projects. Client references and project status are available on request.',
  'portfolio.pageSub': 'A selection of websites, product concepts and web applications. Contact us for project-specific details.',
  'portfolio.badge': 'Selected Work',
  'portfolio.live': 'Project',
  'process.subtitle': 'A structured process, adapted to the scope and needs of each project.',
  'commit.subtitle': 'Explore how project scope, revisions, communication and delivery are organized.',
  'commit.c3.desc': 'The agreed proposal defines the project schedule and what happens if requirements or timing change.',
  'commit.c5.desc': 'Your proposal specifies exactly which source files, licences and access rights are included in the handover.',
  'cta.body': 'Tell us about your project and receive a tailored response and proposal after we review the requirements.',
  'cta.response': 'Response time confirmed on enquiry',
  'footer.response': 'Contact us about availability',
  'footer.secure': 'HTTPS connections',
  'contact.info.responseVal': 'Depends on the enquiry',
  'services.maint.f1': 'Monitoring options',
  'services.landing.desc': 'Landing pages tailored to help visitors understand your offer and take the next step.',
  'services.ecom.desc': 'Custom storefronts with the product, checkout and administration features agreed in your proposal.',
  'services.webapp.desc': 'Interactive web applications with mobile-first experiences and features defined by your requirements.',
};

const tFn = (key: string, fallback?: string): string =>
  verifiedCopy[key] ?? translate('en', key, fallback);

const LanguageContext = createContext<LanguageContextValue>({ t: tFn });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageContext.Provider value={{ t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
