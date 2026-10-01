'use client';

import { useEffect, useRef } from 'react';

/**
 * Flowing "silk" light ribbon — a single full-screen fragment shader.
 * 56 hairline strands follow one curve; the band's signed width swings
 * through zero, so it fans out and twists into a bright knot like folded
 * silk. Tinted with the brand gradient
 * (#a855f7 → #3b82f6 → #06b6d4).
 *
 * - Renders only while on screen and while the tab is visible.
 * - prefers-reduced-motion: draws one still frame.
 * - No WebGL: the CSS fallback glow in the wrapper stays visible.
 */

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uIntensity;
uniform vec2  uAnchor;   // where the ribbon sits (0..1, origin bottom-left)

vec3 brand(float f){
  vec3 a = vec3(0.659, 0.333, 0.969);
  vec3 b = vec3(0.231, 0.510, 0.965);
  vec3 c = vec3(0.024, 0.714, 0.831);
  return f < 0.5 ? mix(a, b, f * 2.0) : mix(b, c, f * 2.0 - 1.0);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - uAnchor) * vec2(asp, 1.0);
  float ang = -0.38;
  p = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p;

  float t = uTime;
  float px = 1.0 / uRes.y;
  float cy = 0.16 * sin(p.x * 1.35 + t * 0.19) + 0.06 * sin(p.x * 2.9 - t * 0.23);
  float W  = 0.20 * cos(p.x * 1.15 + t * 0.27 + 0.9);   // signed half-width: twists through 0
  float sheen = 0.45 + 0.85 * pow(0.5 + 0.5 * sin(p.x * 1.6 - t * 0.5), 2.0);

  vec3 col = vec3(0.0);
  const int N = 56;
  for (int i = 0; i < N; i++) {
    float f = float(i) / float(N - 1);
    float s = f * 2.0 - 1.0;
    float y = cy + s * W + 0.006 * sin(p.x * 6.0 + f * 23.0 + t * 0.7);
    float d = abs(p.y - y);
    float w = 1.1 * px;
    float line = exp(-d * d / (w * w));
    float edge = 0.35 + 0.9 * pow(abs(s), 6.0);
    col += brand(f) * line * edge * 1.15;
  }
  // silk body: faint fill between the edges + glow
  float inside = 1.0 - smoothstep(abs(W) * 0.85, abs(W) + 0.02, abs(p.y - cy));
  col += mix(vec3(0.45,0.28,0.95), vec3(0.15,0.55,0.95), smoothstep(-1.0,1.0,p.x)) * inside * 0.16;
  col += vec3(0.40, 0.30, 0.95) * exp(-abs(p.y - cy) * 5.0) * 0.16;
  // the twist knot catches the light
  float knot = 1.0 - smoothstep(0.0, 0.07, abs(W));
  col += vec3(0.75, 0.70, 1.0) * knot * exp(-abs(p.y - cy) * 26.0) * 1.1;
  col *= sheen;

  float ends = smoothstep(-1.7, -0.5, p.x) * (1.0 - smoothstep(1.0, 2.2, p.x));
  col *= ends * uIntensity;
  col = 1.0 - exp(-col * 1.2);
  float g = fract(sin(dot(gl_FragCoord.xy + t, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * 0.018;
  col += vec3(0.027, 0.024, 0.059);
  gl_FragColor = vec4(col, 1.0);
}
`;

interface SilkRibbonsProps {
  className?: string;
  /** Knot position in the canvas, 0..1 from the bottom-left. */
  anchor?: [number, number];
  intensity?: number;
  /** Time multiplier. */
  speed?: number;
}

export default function SilkRibbons({
  className = '',
  anchor = [0.7, 0.45],
  intensity = 1,
  speed = 1,
}: SilkRibbonsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ax, ay] = anchor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { canvas.style.display = 'none'; return; }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.style.display = 'none'; return; }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = 'none'; return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uIntensity = gl.getUniformLocation(prog, 'uIntensity');
    const uAnchor = gl.getUniformLocation(prog, 'uAnchor');
    gl.uniform1f(uIntensity, intensity);
    gl.uniform2f(uAnchor, ax, ay);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();

    let raf = 0;
    let visible = true;
    let elapsed = 14;         // start on a twist so the first frame is already composed
    let last = performance.now();

    const draw = () => {
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      elapsed += Math.min(0.05, (now - last) / 1000) * speed;
      last = now;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    draw();
    start();

    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start(); else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      // Free GPU objects but keep the context: StrictMode re-runs this effect
      // on the same canvas, and a lost context cannot be recovered.
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [ax, ay, intensity, speed]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        background:
          'radial-gradient(60% 45% at 70% 55%, rgba(124,58,237,0.22) 0%, rgba(59,130,246,0.08) 45%, transparent 75%), #07060f',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
