import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MBN DEV — Custom Websites Built to Elevate Your Business';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07060f 0%, #0d0b1a 50%, #07060f 100%)',
          padding: '80px',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow top-left */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          display: 'flex',
        }} />

        {/* Blue glow bottom-right */}
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-80px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          display: 'flex',
        }} />

        {/* Grid lines overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #7c3aed, #a855f7, #818cf8, transparent)',
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(124,58,237,0.5)',
          }}>
            <span style={{ color: '#fff', fontSize: '22px', fontWeight: 900 }}>M</span>
          </div>
          <span style={{ color: '#fff', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em' }}>
            MBN DEV
          </span>
        </div>

        {/* Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '99px', marginBottom: '28px',
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.3)',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#a855f7', display: 'flex',
          }} />
          <span style={{ color: '#a855f7', fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Premium Web Development
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: '62px', fontWeight: 900, color: '#ffffff',
          lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '24px',
          maxWidth: '780px', display: 'flex', flexWrap: 'wrap',
        }}>
          We build digital experiences that drive real impact.
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: '22px', color: 'rgba(148,163,184,0.8)',
          marginBottom: '48px', maxWidth: '600px', lineHeight: 1.5,
          display: 'flex',
        }}>
          Custom websites, SaaS platforms &amp; web apps — built for ambitious brands.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '48px' }}>
          {[
            { val: '50+', label: 'Happy Clients' },
            { val: '120+', label: 'Projects Delivered' },
            { val: '98%', label: 'Satisfaction Rate' },
            { val: '5+', label: 'Years Experience' },
          ].map(({ val, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{val}</span>
              <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.05em' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* URL badge bottom-right */}
        <div style={{
          position: 'absolute', bottom: '40px', right: '80px',
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '16px', fontWeight: 600 }}>
            mbndev.ma
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
