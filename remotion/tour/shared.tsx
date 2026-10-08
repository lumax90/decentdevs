import { useEffect, useState, type ReactNode } from 'react';
import { AbsoluteFill, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const mix = (a: number, b: number, progress: number) => a + (b - a) * progress;
export const progress = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1], clamp);
export const smooth = (value: number) => value * value * (3 - 2 * value);

export function enter(frame: number, delay = 0) {
  return spring({ frame: frame - delay, fps: 30, config: { damping: 18, stiffness: 120, mass: 0.7 } });
}

const fontCSS = `
@font-face{font-family:Tour;src:url('${staticFile('fonts/manrope-latin.woff2')}') format('woff2');font-weight:200 800}
@font-face{font-family:Tour;src:url('${staticFile('fonts/manrope-latin-ext.woff2')}') format('woff2');font-weight:200 800;unicode-range:U+0100-02BA,U+0304,U+0308,U+0329,U+1E00-1E9F,U+2020,U+20A0-20AB}
.tour-scene{font-family:Tour,sans-serif;font-synthesis:none}
.tour-scene *{box-sizing:border-box}
`;

export function Scene({ children, background, color = '#27332c' }: { children: ReactNode; background: string; color?: string }) {
  const [handle] = useState(() => delayRender('Tour fonts'));
  const { width, height } = useVideoConfig();
  useEffect(() => {
    document.fonts.load('600 24px Tour', 'İyi fikirler çığ öşü').then(() => continueRender(handle)).catch(cancelRender);
  }, [handle]);
  return <AbsoluteFill className="tour-scene" style={{ background, color, overflow: 'hidden' }}><style>{fontCSS}</style><svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ fontFamily: 'Tour, sans-serif', overflow: 'visible' }}>{children}</svg></AbsoluteFill>;
}

export function Text({ x, y, children, size = 20, fill = 'currentColor', weight = 550, anchor = 'start', opacity = 1, mono = false }: { x: number; y: number; children: ReactNode; size?: number; fill?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number; mono?: boolean }) {
  return <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor} opacity={opacity} fontFamily={mono ? 'monospace' : undefined} letterSpacing={mono ? -0.5 : -0.45}>{children}</text>;
}

export function Check({ x, y, size = 12, color = '#527841' }: { x: number; y: number; size?: number; color?: string }) {
  return <path d={`M${x - size * .45} ${y}l${size * .32} ${size * .32} ${size * .65} ${-size * .7}`} fill="none" stroke={color} strokeWidth={size * .17} strokeLinecap="round" strokeLinejoin="round" />;
}

export function Cursor({ x, y, click = 0, color = '#25332c' }: { x: number; y: number; click?: number; color?: string }) {
  return <g transform={`translate(${x} ${y})`}><circle r={5 + click * 17} fill="none" stroke={color} strokeWidth={1.5} opacity={click * (1 - click)} /><path d="M0 0l5 22 4-8 9-3z" fill={color} stroke="#fff" strokeWidth={1.5} /></g>;
}

export function Dots({ x, y, color = '#918b8c' }: { x: number; y: number; color?: string }) {
  return <g fill={color} opacity={.65}>{[0, 1, 2].map(i => <circle key={i} cx={x + i * 11} cy={y} r={3} />)}</g>;
}

export function Packet({ from, to, start, duration = 26, color = '#c9b7f7', size = 7 }: { from: [number, number]; to: [number, number]; start: number; duration?: number; color?: string; size?: number }) {
  const f = useCurrentFrame();
  const p = progress(f, start, start + duration);
  return <circle cx={mix(from[0], to[0], p)} cy={mix(from[1], to[1], p)} r={size} fill={color} opacity={f >= start && p < 1 ? 1 : 0} />;
}
