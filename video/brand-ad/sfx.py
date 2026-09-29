"""MBN DEV sound design: synthesises the whole mix from the film's cue list.

No samples, no stock library: every click, press, whoosh and chime is built here from
sines, filtered noise and envelopes, then placed on the exact frame the timeline registered.
Voice lines (optional) are read from vo/<id>.wav and laid on their cue times.

Usage:  python3 sfx.py out/experience-cues.json out/experience-mix.wav [--vo-dir vo]
"""
import json
import os
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

SR = 48000
RNG = np.random.default_rng(7)


# ── building blocks ──────────────────────────────────────────────────────────
def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, attack=0.002, tau=0.1, hold=0.0):
    t = t_(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-np.clip(t - attack - hold, 0, None) / tau)
    return a * d


def swell(dur, peak=0.5, power=2.0):
    """Smooth rise-and-fall envelope peaking at `peak` (0..1 of duration)."""
    x = t_(dur) / dur
    e = np.where(x < peak, (x / peak), (1 - x) / (1 - peak))
    return np.clip(e, 0, 1) ** power


def noise(dur, ch=1):
    return RNG.standard_normal((int(dur * SR), ch)) if ch > 1 else RNG.standard_normal(int(dur * SR))


def filt(x, lo=None, hi=None, order=4):
    if lo and hi:
        sos = butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    elif lo:
        sos = butter(order, lo, btype='high', fs=SR, output='sos')
    else:
        sos = butter(order, hi, btype='low', fs=SR, output='sos')
    return sosfilt(sos, x, axis=0)


def sweep_bp(x, f0, f1, q=2.0, blocks=48):
    """Band-pass noise whose centre glides f0 → f1 (overlap-added Hann blocks)."""
    n = len(x); hop = max(1, n // blocks); win = np.hanning(2 * hop); out = np.zeros(n)
    for b in range(blocks + 2):
        s, e = b * hop - hop, b * hop + hop
        s0, e0 = max(0, s), min(n, e)
        if e0 - s0 < 16:
            continue
        fc = f0 * (f1 / f0) ** min(1.0, b / blocks); bw = fc / q
        seg = filt(x[s0:e0], max(20, fc - bw / 2), min(SR / 2 - 100, fc + bw / 2), order=2)
        out[s0:e0] += seg * win[s0 - s: e0 - s]
    return out


def sine(f, dur, phase=0.0):
    """f may be a float or an array (glide)."""
    if np.isscalar(f):
        return np.sin(2 * np.pi * f * t_(dur) + phase)
    return np.sin(2 * np.pi * np.cumsum(f) / SR + phase)


def glide(f0, f1, dur, curve=1.0):
    x = (t_(dur) / dur) ** curve
    return f0 * (f1 / f0) ** x


def bell(f, dur=0.9, tau=0.32, attack=0.004, partials=((1, 1.0), (2.0, 0.18), (3.01, 0.06)), detune=0.6):
    out = np.zeros(int(dur * SR))
    for r, a in partials:
        out += a * (sine(f * r, dur) + 0.5 * sine(f * r + detune, dur)) * env(dur, attack, tau / r ** 0.5)
    return out / 1.5


def add(*xs):
    """Sum signals of different lengths (aligned at t=0)."""
    out = np.zeros(max(len(x) for x in xs))
    for x in xs:
        out[: len(x)] += x
    return out


def soft_sat(x, drive=1.4):
    return np.tanh(x * drive) / np.tanh(drive)


# ── the sound palette ────────────────────────────────────────────────────────
def s_impact(scale=1.0, dur=1.6):
    sub = sine(glide(64 * scale, 36, dur, 0.5), dur) * env(dur, 0.006, 0.42)
    body = sine(glide(140 * scale, 72, 0.4, 0.6), 0.4) * env(0.4, 0.003, 0.07)
    thump = filt(noise(0.25), hi=240) * env(0.25, 0.002, 0.04) * 2.2
    x = 0.9 * sub; x[: len(body)] += 0.55 * body; x[: len(thump)] += 0.4 * thump
    return soft_sat(x, 1.6)


def s_impact_soft():
    return 0.55 * s_impact(1.2, 1.0)


def s_impact_final():
    dur = 3.2
    x = 1.1 * s_impact(0.92, dur)
    boom = filt(noise(dur), hi=420) * env(dur, 0.004, 0.35) * 0.7
    air = filt(noise(dur), lo=3000, hi=9000) * env(dur, 0.01, 0.5) * 0.05
    return soft_sat(x + boom + air, 1.3)


def s_texture(d=2.4):
    n = int(d * SR); x = np.zeros(n)
    idx = RNG.choice(n, size=int(d * 55), replace=False)
    x[idx] = RNG.uniform(-1, 1, len(idx))
    x = filt(x, 2500, 9000) * 1.2 + filt(noise(d), 6000, 12000) * 0.02
    return x * swell(d, 0.35, 1.0) * 0.35


def s_ambience(d):
    n = int(d * SR)
    low = filt(noise(d, 2), hi=520) * 0.05
    air = filt(noise(d, 2), 4000, 9000) * 0.006
    t = t_(d)
    drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t) + 0.25 * np.sin(2 * np.pi * 110.3 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
    x = low + air + 0.018 * drone[:, None]
    fade = np.minimum(1, np.minimum(t / 1.5, (d - t) / 2.5))[:, None]
    return x * fade


def s_hover():
    d = 0.3
    x = sweep_bp(noise(d), 700, 2400, q=3) * swell(d, 0.55, 1.5) * 0.5
    return x + 0.03 * sine(glide(1100, 1500, d), d) * swell(d, 0.6, 2)


def s_press():
    """Deep tactile button press: crisp edge, weighted body, soft release."""
    d = 0.32
    edge = filt(noise(0.01), lo=3500) * env(0.01, 0.0003, 0.0018) * 0.6
    thock = sine(glide(230, 120, 0.12, 0.4), 0.12) * env(0.12, 0.0008, 0.028)
    body = filt(noise(0.06), 600, 1600) * env(0.06, 0.0005, 0.012) * 0.5
    rel = (filt(noise(0.01), lo=2500) * env(0.01, 0.0003, 0.0015) * 0.18)
    rel_body = sine(glide(300, 190, 0.06), 0.06) * env(0.06, 0.0008, 0.015) * 0.25
    x = np.zeros(int(d * SR))
    x[: len(edge)] += edge; x[: len(thock)] += thock; x[: len(body)] += body
    o = int(0.085 * SR); x[o: o + len(rel)] += rel; x[o: o + len(rel_body)] += rel_body
    return soft_sat(x * 1.1, 1.3)


def s_click(v=0, soft=False):
    d = 0.12; p = 1 + 0.035 * ((v % 5) - 2)
    edge = filt(noise(0.006), lo=3000) * env(0.006, 0.0003, 0.0012) * 0.5
    tick = sine(1250 * p, d) * env(d, 0.0005, 0.007) * 0.35
    body = sine(glide(420 * p, 260 * p, 0.05), 0.05) * env(0.05, 0.0006, 0.014) * 0.6
    x = np.zeros(int(d * SR)); x[: len(edge)] += edge; x += tick; x[: len(body)] += body
    return x * (0.55 if soft else 0.85)


def s_tap(v=0):
    d = 0.18; f = 1650 * (1 + 0.04 * ((v % 5) - 2))
    x = (sine(f, d) * env(d, 0.001, 0.035) + 0.35 * sine(f * 2.32, d) * env(d, 0.001, 0.018) + 0.12 * sine(f * 4.25, d) * env(d, 0.001, 0.008))
    x += filt(noise(d), 1500, 5000) * env(d, 0.0005, 0.004) * 0.25
    x += sine(glide(260, 180, d), d) * env(d, 0.001, 0.02) * 0.35
    return x * 0.32


def s_confirm():
    d = 1.1; x = np.zeros(int(d * SR))
    a = bell(880, 0.9, 0.3); b = bell(1318.5, 1.0, 0.36)
    x[: len(a)] += 0.5 * a; o = int(0.075 * SR); x[o: o + len(b)] += 0.55 * b[: len(x) - o]
    x += sine(glide(170, 150, d), d) * env(d, 0.004, 0.06) * 0.25
    return filt(x, hi=7000) * 0.42


def s_confirm_soft(v=0):
    notes = [1318.5, 1174.7, 1568.0]
    return filt(bell(notes[v % 3], 0.8, 0.26), hi=7000) * 0.2


def s_confirm_deep():
    d = 1.6
    sub = sine(glide(110, 88, d), d) * env(d, 0.01, 0.35) * 0.7
    b = np.zeros(int(d * SR)); a = bell(659.3, 1.2, 0.45); c = bell(987.8, 1.3, 0.5)
    b[: len(a)] += 0.35 * a; o = int(0.09 * SR); b[o: o + len(c)] += 0.35 * c[: len(b) - o]
    return soft_sat(sub + filt(b, hi=6500) * 0.8, 1.2) * 0.55


def s_pulse():
    d = 0.16
    x = sine(glide(640, 520, d), d) * env(d, 0.004, 0.04) * (0.6 + 0.4 * np.sin(2 * np.pi * 45 * t_(d)))
    return filt(x, 300, 3000) * 0.28


def s_secure(d=0.5):
    x = np.zeros(int((d + 0.3) * SR))
    for i, f in enumerate([720, 680, 640]):
        p = s_pulse() * 0.9; o = int(i * 0.16 * SR); x[o: o + len(p)] += p
    hum = sine(glide(120, 140, d), d) * swell(d, 0.5, 1) * 0.08
    x[: len(hum)] += hum
    return x


def s_whoosh(d=0.35, f0=260, f1=2600, gain=0.55, v=0):
    d = max(d, 0.2); n = noise(d)
    mid = f0 * 3.5
    x = sweep_bp(n, f0, mid, q=1.4) * swell(d, 0.55, 1.6)
    x += 0.4 * sweep_bp(noise(d), mid, f1, q=2) * swell(d, 0.65, 2.2)
    return x * gain


def s_swipe(d=0.3, up=True, gain=0.3):
    d = max(d, 0.14)
    f0, f1 = (1800, 5200) if up else (5200, 1600)
    return sweep_bp(noise(d), f0, f1, q=2.5) * swell(d, 0.45, 1.4) * gain


def s_snap(v=0):
    d = 0.1; p = 1 + 0.06 * v
    edge = filt(noise(0.004), lo=4000) * env(0.004, 0.0002, 0.0009) * 0.45
    res = sine(2350 * p, d) * env(d, 0.0003, 0.005) * 0.25
    low = sine(glide(380 * p, 260, 0.05), 0.05) * env(0.05, 0.0005, 0.012) * 0.5
    x = np.zeros(int(d * SR)); x[: len(edge)] += edge; x += res; x[: len(low)] += low
    return x * 0.5


def s_flow(d=0.7):
    d = max(d, 0.4)
    x = sweep_bp(noise(d), 180, 900, q=1.2) * swell(d, 0.5, 1.6) * 0.5
    x += sine(glide(170, 230, d), d) * swell(d, 0.5, 2) * 0.05
    return x


def s_key(v=0, space=False):
    d = 0.07; p = 1 + 0.07 * ((v % 7) - 3) / 3
    thock = sine(glide((150 if space else 210) * p, 120, 0.04), 0.04) * env(0.04, 0.0006, 0.012 if not space else 0.018)
    clk = filt(noise(0.01), 2200 * p, 6000) * env(0.01, 0.0002, 0.0016)
    x = np.zeros(int(d * SR)); x[: len(thock)] += 0.55 * thock; x[: len(clk)] += 0.5 * clk
    return x * (0.34 if not space else 0.4)


def s_notify(v=0):
    pairs = [(1318.5, 1975.5), (1174.7, 1760.0), (1568.0, 2349.3)]
    a, b = pairs[v % 3]; d = 1.2; x = np.zeros(int(d * SR))
    p = bell(a, 0.9, 0.24, partials=((1, 1), (2.0, 0.12))); q = bell(b, 1.1, 0.34, partials=((1, 1), (2.0, 0.1)))
    x[: len(p)] += 0.5 * p; o = int(0.095 * SR); x[o: o + len(q)] += 0.45 * q[: len(x) - o]
    return filt(x, hi=8000) * 0.3


def s_notify_msg():
    d = 0.6
    f = np.concatenate([glide(700, 990, 0.05), np.full(int(d * SR) - int(0.05 * SR), 990.0)])
    x = sine(f, d) * env(d, 0.008, 0.16) + 0.25 * sine(f * 2, d) * env(d, 0.008, 0.08)
    return filt(x, hi=7000) * 0.28


def s_typing(d=0.5):
    x = np.zeros(int((d + 0.1) * SR))
    for i in range(6):
        k = s_key(i) * 0.5; o = int(i * d / 6 * SR); x[o: o + len(k)] += k
    return x


def s_tick(v=0):
    d = 0.03
    return sine(2800 * (1 + 0.02 * (v % 4)), d) * env(d, 0.0003, 0.0035) * 0.16


def s_ticks(d=0.9, n=18, rise=False):
    x = np.zeros(int((d + 0.05) * SR))
    for i in range(n):
        u = i / (n - 1); tt = d * (1 - (1 - u) ** 2) if not rise else d * u
        k = sine(2600 + (i * 40 if rise else 0), 0.03) * env(0.03, 0.0003, 0.003) * 0.12
        o = int(tt * SR); x[o: o + len(k)] += k[: len(x) - o]
    return x


def s_tick_up():
    d = 0.35
    tick = np.pad(s_tick(0) * 1.4, (0, int(d * SR) - int(0.03 * SR)))
    return tick + sine(glide(900, 1350, d, 0.5), d) * env(d, 0.004, 0.08) * 0.09


def s_chart(d=1.1):
    return sine(glide(300, 620, d, 0.8), d) * swell(d, 0.7, 1.5) * 0.06 + sweep_bp(noise(d), 1500, 4500, q=3) * swell(d, 0.7, 1.5) * 0.12


def s_shimmer(d=1.4):
    x = sweep_bp(noise(d), 2800, 7500, q=3) * (0.55 + 0.45 * np.sin(np.pi * t_(d) / 0.7) ** 2) * swell(d, 0.4, 1)
    return x * 0.22


def s_appear(p=0):
    d = 0.12; f = 880 * 2 ** ((p * 2) / 12)
    return sine(f, d) * env(d, 0.004, 0.028) * 0.11 + sine(f * 2, d) * env(d, 0.004, 0.012) * 0.03


def s_hint():
    d = 0.7; x = np.zeros(int(d * SR))
    a = bell(783.99, 0.5, 0.18); b = bell(659.25, 0.6, 0.22)
    x[: len(a)] += a; o = int(0.08 * SR); x[o: o + len(b)] += b[: len(x) - o]
    return filt(x, hi=5000) * 0.1


def s_send():
    d = 0.45
    return s_whoosh(d, 400, 3400, 0.4) + np.concatenate([s_click(2, True), np.zeros(int(d * SR) - int(0.12 * SR))])


def s_glass(d=0.4):
    x = sweep_bp(noise(d), 2200, 4200, q=4) * swell(d, 0.3, 1.2) * 0.22
    x += sine(4180, d) * env(d, 0.01, 0.12) * 0.012 + sine(2790, d) * env(d, 0.01, 0.1) * 0.012
    return x


def s_range():
    d = 0.4
    return sine(glide(620, 930, d, 0.6), d) * env(d, 0.006, 0.12) * 0.08 + np.pad(s_swipe(0.3, True, 0.15), (0, int(d * SR) - int(0.3 * SR)))


def s_drag(d=0.45):
    x = filt(noise(d), 140, 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * t_(d))) * swell(d, 0.5, 0.8)
    return x * 0.16


def s_drop():
    d = 0.5
    x = sine(glide(120, 70, 0.3), 0.3) * env(0.3, 0.002, 0.07)
    y = filt(noise(0.2), hi=900) * env(0.2, 0.001, 0.03) * 0.6
    out = np.zeros(int(d * SR)); out[: len(x)] += x; out[: len(y)] += y
    return soft_sat(out, 1.2) * 0.5


def s_progress(d=0.62):
    return add(s_ticks(d, 16, rise=True) * 1.2, sine(glide(420, 700, d), d) * swell(d, 0.8, 1) * 0.03)


def s_cut():
    return s_whoosh(0.22, 500, 3000, 0.25)


def s_sync(d=0.34):
    x = np.zeros(int((d + 0.2) * SR))
    p = s_pulse(); x[: len(p)] += p
    z = sine(glide(520, 1560, d, 1.4), d) * swell(d, 0.8, 1.2) * 0.05; x[: len(z)] += z
    return x


def s_rise(d=3.6):
    t = t_(d)
    cutoff_env = (t / d) ** 1.8
    n = noise(d); x = np.zeros_like(n); blocks = 36; hop = len(n) // blocks + 1
    for b in range(blocks):
        s, e = b * hop, min(len(n), (b + 1) * hop)
        fc = 180 + 2200 * cutoff_env[s]
        x[s:e] = filt(n[s:e], hi=fc, order=2)
    sub = sum(np.sin(2 * np.pi * np.cumsum(glide(41 * h, 62 * h, d)) / SR) / h for h in (1, 2, 3, 4))
    e = (t / d) ** 2.2 * np.clip((d - t) / 0.25, 0, 1)
    return (x * 0.28 + sub * 0.22) * e


def s_assemble(v=0):
    return s_snap(v % 3) * 0.9 + np.pad(sine(glide(160, 110, 0.08), 0.08) * env(0.08, 0.001, 0.02) * 0.2, (0, int(0.1 * SR) - int(0.08 * SR)))


def s_transform(d=1.0):
    x = s_whoosh(d, 200, 4200, 0.6)
    x += sweep_bp(noise(d), 3000, 8000, q=3) * swell(d, 0.8, 2) * 0.12
    return x


def s_pop():
    d = 0.14
    return sine(glide(900, 1500, d, 0.3), d) * env(d, 0.002, 0.03) * 0.14


def s_resonance(d=4.5):
    f = 523.25; x = np.zeros(int(d * SR))
    for r, a, tau in ((1, 1, 2.6), (2.756, 0.45, 1.5), (5.404, 0.2, 0.8), (8.933, 0.08, 0.4)):
        x += a * (sine(f * r, d) + 0.7 * sine(f * r + 0.7, d)) * env(d, 0.02, tau)
    return filt(x, hi=6000) * 0.045


PALETTE = {
    'impact': (lambda c: s_impact() * 0.8, 0.30), 'impactSoft': (lambda c: s_impact_soft(), 0.25), 'impactFinal': (lambda c: s_impact_final(), 0.4),
    'texture': (lambda c: s_texture(c.get('d', 2.4)), 0.2), 'hover': (lambda c: s_hover(), 0.15),
    'press': (lambda c: s_press(), 0.1), 'click': (lambda c: s_click(c.get('v', 0)), 0.08), 'clickSoft': (lambda c: s_click(c.get('v', 0), True), 0.08),
    'tap': (lambda c: s_tap(c.get('v', 0)), 0.1), 'confirm': (lambda c: s_confirm(), 0.3), 'confirmSoft': (lambda c: s_confirm_soft(c.get('v', 0)), 0.3),
    'confirmDeep': (lambda c: s_confirm_deep(), 0.35), 'pulse': (lambda c: s_pulse(), 0.15), 'secure': (lambda c: s_secure(c.get('d', 0.5)), 0.15),
    'whoosh': (lambda c: s_whoosh(c.get('d', 0.32), v=c.get('v', 0)), 0.12), 'whooshSmall': (lambda c: s_whoosh(0.26, 400, 3000, 0.3), 0.1),
    'swipe': (lambda c: s_swipe(c.get('d', 0.3), True), 0.1), 'swipeDown': (lambda c: s_swipe(c.get('d', 0.3), False), 0.1),
    'swipeTiny': (lambda c: s_swipe(0.16, True, 0.15), 0.08), 'swipeSoft': (lambda c: s_swipe(c.get('d', 0.6), True, 0.16), 0.1),
    'snap': (lambda c: s_snap(c.get('v', 0)), 0.08), 'flow': (lambda c: s_flow(c.get('d', 0.7)), 0.12), 'key': (lambda c: s_key(c.get('v', 0), c.get('space', False)), 0.05),
    'notify': (lambda c: s_notify(c.get('v', 0)), 0.3), 'notifyMsg': (lambda c: s_notify_msg(), 0.25), 'typing': (lambda c: s_typing(c.get('d', 0.5)), 0.05),
    'tick': (lambda c: s_tick(c.get('v', 0)) * 1.6, 0.1), 'ticks': (lambda c: s_ticks(c.get('d', 0.9)), 0.1), 'tickUp': (lambda c: s_tick_up(), 0.15),
    'chart': (lambda c: s_chart(c.get('d', 1.1)), 0.15), 'shimmer': (lambda c: s_shimmer(c.get('d', 1.4)) * 2.0, 0.15), 'appear': (lambda c: s_appear(c.get('p', 0)) * 1.8, 0.15),
    'hint': (lambda c: s_hint(), 0.2), 'send': (lambda c: s_send(), 0.12), 'glass': (lambda c: s_glass(), 0.25), 'range': (lambda c: s_range(), 0.12),
    'grab': (lambda c: s_click(1, True), 0.06), 'drag': (lambda c: s_drag(c.get('d', 0.45)), 0.05), 'drop': (lambda c: s_drop(), 0.18),
    'progress': (lambda c: s_progress(c.get('d', 0.62)), 0.1), 'cut': (lambda c: s_cut(), 0.1), 'sync': (lambda c: s_sync(c.get('d', 0.34)), 0.15),
    'rise': (lambda c: s_rise(c.get('d', 3.6)), 0.25), 'assemble': (lambda c: s_assemble(c.get('v', 0)), 0.15), 'settle': (lambda c: s_impact_soft() * 0.8, 0.3),
    'transform': (lambda c: s_transform(c.get('d', 1.0)), 0.2), 'pop': (lambda c: s_pop(), 0.12), 'resonance': (lambda c: s_resonance(c.get('d', 4.5)), 0.6),
    'ambience': (lambda c: s_ambience(c.get('d', 50)), 0.0), 'scroll': (lambda c: s_flow(c.get('d', 1.8)) * 1.8 + s_swipe(c.get('d', 1.8), True, 0.14), 0.1),
}


def reverb_ir(dur=1.8, tau=0.42):
    t = t_(dur)
    ir = noise(dur, 2) * np.exp(-t / tau)[:, None]
    ir = filt(ir, hi=5500, order=2)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def main():
    cues_path, out_path = sys.argv[1], sys.argv[2]
    vo_dir = sys.argv[sys.argv.index('--vo-dir') + 1] if '--vo-dir' in sys.argv else None
    cues = json.load(open(cues_path))
    total = int((cues['duration'] + 1.0) * SR)
    dry = np.zeros((total, 2)); send = np.zeros((total, 2))
    unknown = set()
    for c in cues['sfx']:
        if c['type'] not in PALETTE:
            unknown.add(c['type']); continue
        make, wet = PALETTE[c['type']]
        x = make(c)
        if x.ndim == 1:
            pan = c.get('pan', 0.0)
            x = np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))], axis=1) * np.sqrt(2)
        o = int(c['t'] * SR); n = min(len(x), total - o)
        if n <= 0:
            continue
        dry[o: o + n] += x[:n]; send[o: o + n] += x[:n] * wet
    wet = np.stack([fftconvolve(send[:, i], reverb_ir()[:, i])[:total] for i in range(2)], axis=1)
    mix = dry + wet * 0.9

    if vo_dir:
        for v in cues['vo']:
            p = os.path.join(vo_dir, f"{v['id']}.wav")
            if not os.path.exists(p):
                print('missing voice file', p); continue
            sr, y = wavfile.read(p)
            y = y.astype(np.float64); y /= (np.abs(y).max() + 1e-9)
            if y.ndim == 1:
                y = np.stack([y, y], axis=1)
            if sr != SR:
                y = resample_poly(y, SR, sr, axis=0)
            o = int(v['t'] * SR); n = min(len(y), total - o)
            # gentle duck of the sound design under the voice
            duck = np.ones(total); duck[o: o + n] = 0.6
            duck = filt(duck, hi=6, order=1)
            mix *= duck[:, None]
            mix[o: o + n] += y[:n] * 0.5

    mix = filt(mix, lo=28, order=2)  # clean sub-rumble
    peak = np.abs(mix).max()
    mix = soft_sat(mix / peak * 1.05, 1.1) * (10 ** (-1.5 / 20))
    tail = int(1.0 * SR); mix[-tail:] *= np.linspace(1, 0, tail)[:, None]
    mix = mix[: int(cues['duration'] * SR)]
    wavfile.write(out_path, SR, (mix * 32767).astype(np.int16))
    print(f'Wrote {out_path} · {len(cues["sfx"])} cues' + (f' · unknown: {sorted(unknown)}' if unknown else ''))


if __name__ == '__main__':
    main()
