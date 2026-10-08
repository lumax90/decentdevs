import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { cancelRender, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const C = { paper: '#f3f0e9', ink: '#242721', dark: '#191c1a', lavender: '#cdbde9', lime: '#d7ee9c', mint: '#dce8d1', coral: '#e8b194', red: '#dd806b', muted: '#777c71', line: '#d8d8cc', white: '#fffefa' };
export type Chapter = { id: string; from: number; durationInFrames: number; voiceFrom: number; voiceDurationInFrames: number };
export type Caption = { start: number; end: number; text: string };
export type Timing = { ready: boolean; fps: number; durationInFrames: number; chapters: Chapter[]; captions: Caption[]; voiceId?: string; speed?: number };

export const ChapterContext = createContext<Chapter>({ id: '', from: 0, durationInFrames: 600, voiceFrom: 0, voiceDurationInFrames: 0 });
export const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const p = clamp(t); return p * p * (3 - 2 * p); };
export const phase = (p: number, start: number, end: number) => smooth((p - start) / (end - start));
export const easeOut = (t: number) => 1 - (1 - clamp(t)) ** 3;

export function useShot() {
  const f = useCurrentFrame();
  const chapter = useContext(ChapterContext);
  const { fps } = useVideoConfig();
  return { f, p: f / chapter.durationInFrames, fps, chapter, duration: chapter.durationInFrames, seconds: f / fps };
}

export function Pop({ children, delay = 0, style = {} }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const { f, fps } = useShot();
  const a = spring({ frame: f - delay, fps, config: { damping: 24, stiffness: 160, mass: 0.8 } });
  return <div style={{ opacity: clamp((f - delay) / 10), transform: `translateY(${(1 - a) * 70}px) scale(${mix(.96, 1, a)})`, ...style }}>{children}</div>;
}

export function Camera({ children, zoom = 1, x = 0, y = 0, rotate = 0 }: { children: ReactNode; zoom?: number; x?: number; y?: number; rotate?: number }) {
  return <div className="intro-camera" style={{ transform: `translate(${x}px,${y}px) scale(${zoom}) rotate(${rotate}deg)` }}>{children}</div>;
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) { return <div className="intro-eyebrow" style={style}>{children}</div>; }
export function Headline({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) { return <div className="intro-headline" style={style}>{children}</div>; }

export function IntroFonts() {
  const [handle] = useState(() => delayRender('Decent intro: local fonts'));
  useEffect(() => { Promise.all([document.fonts.load('600 40px Intro', 'Good enough'), document.fonts.load('500 36px Intro', 'Çalışan ürün, doğru karar')]).then(() => continueRender(handle)).catch(cancelRender); }, [handle]);
  return <style>{`
  @font-face{font-family:Intro;font-weight:200 800;font-style:normal;src:url('${staticFile('fonts/manrope-latin-ext.woff2')}') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
  @font-face{font-family:Intro;font-weight:200 800;font-style:normal;src:url('${staticFile('fonts/manrope-latin.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
  `}</style>;
}
