'use client';

import { useEffect, useState } from 'react';

/**
 * Temporary on-device diagnostics, only with ?debug=1 in the URL: shows
 * JavaScript errors and basic page state, for debugging on phones.
 */
export default function DebugOverlay() {
  const [lines, setLines] = useState<string[]>([]);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('debug')) return;
    const add = (l: string) => setLines((xs) => [...xs.slice(-14), `${new Date().toISOString().slice(11, 19)} ${l}`]);
    const onErr = (e: ErrorEvent) => add(`ERROR ${e.message} @ ${(e.filename || '').split('/').pop()}:${e.lineno}`);
    const onRej = (e: PromiseRejectionEvent) => add(`REJECT ${String((e.reason && (e.reason.message || e.reason)) || e.reason).slice(0, 200)}`);
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    const tick = setInterval(() => {
      const main = document.querySelector('main');
      const page = main?.lastElementChild as HTMLElement | null;
      add(`path=${location.pathname} w=${innerWidth} articles=${document.querySelectorAll('article').length} rows=${document.querySelectorAll('tbody tr').length} pageOpacity=${page ? getComputedStyle(page).opacity : '-'} mainH=${main?.scrollHeight ?? '-'} body=${document.body.className.slice(0, 40)} text=${(page?.innerText || '').slice(0, 40).replace(/\s+/g, ' ')}`);
    }, 2000);
    setOn(true);
    return () => { window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onRej); clearInterval(tick); };
  }, []);

  if (!on) return null;
  return (
    <pre style={{ position: 'fixed', left: 4, right: 4, top: 60, zIndex: 2147483647, maxHeight: '45vh', overflow: 'auto', background: 'rgba(0,0,0,0.85)', color: '#7CFC00', font: '10px/1.35 monospace', padding: 6, borderRadius: 6, whiteSpace: 'pre-wrap', pointerEvents: 'none' }}>
      {lines.join('\n') || 'debug on…'}
    </pre>
  );
}
