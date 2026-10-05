'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Opening title sequence, once per browser session (website and installed app).
 *
 * The whole sequence is CSS (`.mbn-intro*` in globals.css), so it starts with
 * the first paint — before React hydrates — and the page never flashes first.
 * A tiny inline script in <head> (INTRO_HEAD_SCRIPT) marks <html> with
 * `intro-done` when the intro already played this session; CSS then hides it.
 * This component only removes the overlay when the curtain has finished, and
 * lets a tap skip ahead.
 */

export const INTRO_SESSION_KEY = 'mbn-intro-played';

export const INTRO_HEAD_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem('${INTRO_SESSION_KEY}'))d.classList.add('intro-done');else{sessionStorage.setItem('${INTRO_SESSION_KEY}','1');d.classList.add('intro-playing')}}catch(e){document.documentElement.classList.add('intro-done')}`;

const WORD = ['M', 'B', 'N', ' ', 'D', 'E', 'V'];
const STRANDS = [-18, -9, 0, 9, 18];

export default function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const finish = () => {
    document.documentElement.classList.remove('intro-playing');
    setGone(true);
  };

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!el || root.classList.contains('intro-done')) { finish(); return; }
    // Remove the overlay when its CSS animations end (they may already have,
    // if hydration was slow). A timer backs this up.
    let done = false;
    const end = () => { if (!done) { done = true; finish(); } };
    const anims = el.getAnimations?.({ subtree: true }) ?? [];
    if (anims.length) Promise.all(anims.map((a) => a.finished)).then(end, end);
    const t = setTimeout(end, 2500);
    return () => clearTimeout(t);
  }, []);

  const skip = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(finish, 700);
  };

  if (gone) return null;

  return (
    <div ref={ref} className={`mbn-intro${leaving ? ' is-leaving' : ''}`} onClick={skip} aria-hidden="true">
      {/* curtain halves — they part at the end */}
      <div className="mbn-intro-panel mbn-intro-panel-top" />
      <div className="mbn-intro-panel mbn-intro-panel-bottom" />

      <div className="mbn-intro-stage">
        {/* silk light: five strands drawing across the frame */}
        <svg className="mbn-intro-silk" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mbnIntroSilk" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="0.25" stopColor="#a855f7" />
              <stop offset="0.6" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          {STRANDS.map((o, i) => (
            <path
              key={o}
              pathLength={1}
              style={{ animationDelay: `${0.09 + i * 0.025}s` }}
              d={`M -40 ${250 + o} C 260 ${120 - o * 2}, 520 ${330 + o}, 760 ${200 - o} S 1100 ${90 + o}, 1260 ${150 - o}`}
              stroke="url(#mbnIntroSilk)"
              strokeWidth={i === 2 ? 2.2 : 1}
              fill="none"
            />
          ))}
        </svg>

        <div className="mbn-intro-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand-icon-transparent.webp" alt="" width={112} height={112} />
        </div>

        <div className="mbn-intro-word">
          {WORD.map((ch, i) => (
            <span key={i} className={i >= 4 ? 'is-accent' : undefined} style={{ animationDelay: `${0.47 + i * 0.02}s` }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>

        <p className="mbn-intro-tag">Your idea · Our code · A brighter tomorrow</p>
      </div>

      <div className="mbn-intro-hud">
        <span className="mbn-intro-skip">Tap to skip</span>
        <span className="mbn-intro-count" />
      </div>
      <div className="mbn-intro-progress" />
    </div>
  );
}
