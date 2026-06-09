'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, FolderOpen, DollarSign, BookOpen } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

const tabs = [
  { href: '/',          icon: Home,       label: 'Home'      },
  { href: '/services',  icon: Briefcase,  label: 'Services'  },
  { href: '/portfolio', icon: FolderOpen, label: 'Portfolio' },
  { href: '/pricing',   icon: DollarSign, label: 'Pricing'   },
  { href: '/insights',  icon: BookOpen,   label: 'Insights'  },
];

export default function LandingBottomNav() {
  const pathname = usePathname();
  const haptic   = useHaptic();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background:           'rgba(6, 6, 9, 0.96)',
        backdropFilter:       'blur(40px) saturate(2)',
        WebkitBackdropFilter: 'blur(40px) saturate(2)',
        borderTop:            '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      {/* Brand hairline along the top edge */}
      <div
        className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35), rgba(59,130,246,0.25), transparent)' }}
      />

      <div
        className="flex items-stretch justify-around"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon   = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => haptic('selection')}
              className="relative flex flex-col items-center justify-center gap-[3px] flex-1 py-2.5 min-h-[58px] select-none"
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator — slides between tabs */}
              {active && (
                <motion.div
                  layoutId="landing-tab-indicator"
                  className="absolute top-0 rounded-full"
                  style={{
                    width:      22,
                    height:     2.5,
                    background: 'linear-gradient(90deg, #8b5cf6, #c4b5fd)',
                    boxShadow:  '0 0 10px rgba(139,92,246,0.5)',
                  }}
                  transition={{ type: 'spring', damping: 26, stiffness: 380, mass: 0.5 }}
                />
              )}

              {/* Soft glow bubble — slides with the active tab */}
              {active && (
                <motion.div
                  layoutId="landing-tab-glow"
                  className="absolute rounded-2xl pointer-events-none"
                  style={{
                    inset: '6px 10px',
                    background: 'radial-gradient(ellipse 70% 60% at 50% 38%, rgba(124,58,237,0.14), transparent 75%)',
                  }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.6 }}
                />
              )}

              {/* Icon — springs on activation, squishes on press */}
              <motion.div
                className="relative flex items-center justify-center w-[26px] h-[26px]"
                whileTap={{ scale: 0.82 }}
                transition={{ type: 'spring', damping: 18, stiffness: 400 }}
              >
                <motion.div
                  animate={active ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 340, mass: 0.6 }}
                >
                  <Icon
                    style={{
                      width:    21,
                      height:   21,
                      color:    active ? '#c4b5fd' : 'rgba(100,116,139,0.55)',
                      filter:   active ? 'drop-shadow(0 0 6px rgba(196,181,253,0.3))' : undefined,
                      transition: 'color 0.2s, filter 0.2s',
                    }}
                    strokeWidth={active ? 2 : 1.6}
                  />
                </motion.div>
              </motion.div>

              {/* Label */}
              <span
                style={{
                  fontSize:   10,
                  lineHeight: 1,
                  fontWeight: active ? 600 : 400,
                  color:      active ? '#c4b5fd' : 'rgba(100,116,139,0.65)',
                  transition: 'color 0.2s',
                  letterSpacing: '0.01em',
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
