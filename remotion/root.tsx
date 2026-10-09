import { AbsoluteFill, Audio, Composition, Easing, Sequence, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { useEffect, useState } from 'react';
import { BrandMark } from '../src/components/brand';
import { LampArt, OrbitDemo, SakinDemo } from '../src/components/demos';
import '../src/app/globals.css';

const colors = { ink: '#24202c', lavender: '#d8cbed', lime: '#d5f5a1', cream: '#f2eee7', dark: '#17151c' };

const fontCSS = `
@font-face { font-family: 'Film'; font-style:normal; font-weight:200 800; src:url('${staticFile('fonts/manrope-latin-ext.woff2')}') format('woff2'); unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }
@font-face { font-family: 'Film'; font-style:normal; font-weight:200 800; src:url('${staticFile('fonts/manrope-latin.woff2')}') format('woff2'); unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }
.film-root { --font-heading:'Film',sans-serif; --font-body:'Film',sans-serif; font-family:'Film',sans-serif; }
.film-root *, .film-root *::before, .film-root *::after { animation:none!important; transition:none!important; }
`;

function Fonts() {
  const [handle] = useState(() => delayRender('Loading locally hosted film fonts'));
  useEffect(() => {
    Promise.all([document.fonts.load('600 32px Film', 'Good enough. İyi şeyler'), document.fonts.load('400 24px Film', 'çğıöşü')]).then(() => continueRender(handle)).catch(cancelRender);
  }, [handle]);
  return <style>{fontCSS}</style>;
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

function BrandLine({ light = false }: { light?: boolean }) {
  return <div style={{ position: 'absolute', left: 90, right: 90, top: 63, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: light ? '#eae2f4' : '#6e5e80' }}><span style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 28, letterSpacing: -1.5, fontWeight: 600 }}><BrandMark className="film-brand-icon" /><style>{'.film-brand-icon{width:40px;height:40px;color:#bca5da;--mark-ink:#66537f}'}</style>decent<span style={{ fontWeight: 400, marginLeft: -12 }}>devs.</span></span><span style={{ fontSize: 13, letterSpacing: 3 }}>BİRAZ MERAK. BOLCA ÖZEN.</span></div>;
}

function Lift({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ fps, frame: frame - delay, config: { damping: 22, stiffness: 115, mass: 0.8 } });
  return <div style={{ opacity: interpolate(frame, [delay, delay + 12], [0, 1], clamp), transform: `translateY(${(1 - p) * 75}px)`, ...style }}>{children}</div>;
}

function Idea() {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: colors.lavender, color: colors.ink, padding: '270px 140px 100px' }}><BrandLine />
    <Lift delay={4}><div style={{ fontSize: 164, lineHeight: 1.09, fontWeight: 550, letterSpacing: -11 }}>Bir fikir<br />var<span style={{ color: '#a38aba' }}>.</span></div></Lift>
    <Lift delay={19}><div style={{ fontSize: 32, color: '#7d688f', marginTop: 42 }}>Aklından çıkmayan o şey.</div></Lift>
    <div style={{ position: 'absolute', width: 450, height: 450, color: '#e9def6', '--mark-ink': '#a38ab9', top: 304 + Math.sin(f / 24) * 8, right: 180, transform: `rotate(${12 + Math.sin(f / 20) * 3}deg) scale(${interpolate(f, [0, 23], [.65, 1], { ...clamp, easing: Easing.out(Easing.cubic) })})`, opacity: interpolate(f, [0, 12], [0, 1], clamp), filter: 'drop-shadow(30px 45px 0px #aa90c334)' } as React.CSSProperties}><BrandMark /><style>{'.film-root .film-brand-icon{display:block}'}</style></div>
    <div style={{ position: 'absolute', color: '#705987', bottom: 105, right: 210, fontSize: 26, transform: 'rotate(-7deg)' }}>hello, possibilities.</div>
  </AbsoluteFill>;
}

function Draft() {
  const f = useCurrentFrame();
  const text = 'Ekibim için sade bir uygulama...';
  return <AbsoluteFill style={{ background: colors.dark, color: '#f5f0fa' }}><BrandLine light />
    <Lift style={{ textAlign: 'center', marginTop: 211 }}><div style={{ fontSize: 101, letterSpacing: -6, fontWeight: 500 }}>İyi bir başlangıç.</div><div style={{ fontSize: 29, color: '#a799ba', marginTop: 18 }}>AI, düşünceyi hızlandırır.</div></Lift>
    <Lift delay={8} style={{ position: 'absolute', left: 335, top: 452, width: 1250 }}><div style={{ background: '#eee6f8', color: colors.ink, padding: 37, borderRadius: 27, boxShadow: '0 30px 70px #0005', transform: `rotate(${interpolate(f, [0, 75], [-3, 0], clamp)}deg)` }}><div style={{ display: 'flex', gap: 22, alignItems: 'center', padding: '12px 12px 32px', borderBottom: '1px solid #d4c5e4' }}><span style={{ fontSize: 40, color: '#9f83bf' }}>✳</span><span style={{ fontSize: 31, letterSpacing: -.6 }}>{text.slice(0, Math.floor(Math.max(0, f - 8) / 1.35))}<span style={{ color: '#b598d1', opacity: f % 20 < 10 ? 1 : .25 }}>|</span></span><span style={{ marginLeft: 'auto', width: 49, height: 49, borderRadius: 15, background: '#c1a4df', color: '#fff', textAlign: 'center', lineHeight: '49px', fontSize: 30 }}>↑</span></div>
      <div style={{ display: 'flex', gap: 20, paddingTop: 30 }}>{[0, 1, 2].map((v) => <div key={v} style={{ flex: 1, height: 115, padding: 22, background: ['#d9c8ec', '#dce4cc', '#ead8cb'][v], borderRadius: 15, transform: `scale(${interpolate(f, [28 + v * 9, 42 + v * 9], [.9, 1], clamp)})`, opacity: interpolate(f, [28 + v * 9, 42 + v * 9], [0, 1], clamp) }}><div style={{ width: 100, height: 9, borderRadius: 6, background: '#8f7da23f' }} /><div style={{ width: 185, height: 14, marginTop: 20, borderRadius: 6, background: '#8f7da244' }} /></div>)}</div></div></Lift>
    <Lift delay={48} style={{ position: 'absolute', bottom: 100, width: '100%', textAlign: 'center', fontSize: 18, color: '#8a7d98', letterSpacing: 2 }}>İLK TASLAK HAZIR. ŞİMDİ İNCELİKLER.</Lift>
  </AbsoluteFill>;
}

function Craft() {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: colors.cream, color: '#34312c' }}><BrandLine />
    <Lift style={{ position: 'absolute', left: 120, top: 285 }}><div style={{ fontSize: 124, lineHeight: 1.12, letterSpacing: -8, fontWeight: 550 }}>Asıl iş,<br />ince iş.</div><div style={{ marginTop: 40, fontSize: 29, color: '#8f8477' }}>Taslak → çalışan ürün.</div></Lift>
    <div style={{ position: 'absolute', right: 124, top: 245, width: 817 }}>
      {['Mimariyi doğru kur.', 'Gerçek veriye bağla.', 'Kritik akışları test et.'].map((text, i) => <Lift key={text} delay={i * 29 + 5}><div style={{ display: 'flex', alignItems: 'center', gap: 25, background: ['#e3d9ed', '#dce5cd', '#eddbca'][i], border: '1px solid #ffffff80', padding: '35px 32px', borderRadius: 21, marginBottom: 19, transform: `rotate(${[2, -2, 1][i]}deg)` }}><span style={{ display: 'grid', placeItems: 'center', width: 51, height: 51, borderRadius: '50%', background: '#ffffff75', color: '#6d7860', fontSize: 30, opacity: interpolate(f, [i * 29 + 21, i * 29 + 32], [.25, 1], clamp) }}>✓</span><span style={{ fontSize: 32, letterSpacing: -1 }}>{text}</span><span style={{ marginLeft: 'auto', fontSize: 15, color: '#8d807e' }}>0{i + 1}</span></div></Lift>)}
      <Lift delay={90}><div style={{ padding: '26px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 22, color: '#8a7d73' }}><span>Doğru araçlar + insan muhakemesi</span><span>↗</span></div></Lift>
    </div>
    <div style={{ position: 'absolute', left: 126, bottom: 103, fontSize: 17, letterSpacing: 2, color: '#9c8e7f' }}>HER DETAYIN BİR SEBEBİ VAR.</div>
  </AbsoluteFill>;
}

function Everywhere() {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: '#dce8d0', color: '#34432b' }}><BrandLine />
    <Lift style={{ textAlign: 'center', marginTop: 158 }}><div style={{ fontSize: 88, letterSpacing: -5, fontWeight: 550 }}>Her ekranda. Yerli yerinde.</div></Lift>
    <Lift delay={8} style={{ position: 'absolute', left: 500, top: 350, width: 706, transform: `translateY(${interpolate(f,[0,25],[90,0],clamp)}px) rotate(-3deg) scale(1.21)`, transformOrigin: 'top center', filter: 'drop-shadow(0 25px 25px #42503926)' }}><OrbitDemo /></Lift>
    <Lift delay={15} style={{ position: 'absolute', left: 166, top: 342, width: 218, transform: `translateY(${interpolate(f,[15,40],[70,0],clamp)}px) rotate(-8deg) scale(1.2)`, transformOrigin: 'top center', filter: 'drop-shadow(0 25px 20px #42503930)' }}><SakinDemo /></Lift>
    <Lift delay={22} style={{ position: 'absolute', right: 120, top: 387, width: 335, background: '#f4eade', borderRadius: 25, padding: 25, transform: `translateY(${interpolate(f,[22,45],[70,0],clamp)}px) rotate(8deg)`, boxShadow: '0 25px 50px #45553720' }}><div style={{ color: '#927865', fontSize: 28, fontWeight: 550 }}>luma.</div><LampArt /><div style={{ color: '#997e6b', fontSize: 17 }}>Biraz tasarım, bolca his.</div></Lift>
    <div style={{ position: 'absolute', bottom: 48, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: 13 }}>{['React', 'Vue', 'Nuxt', 'Rust', 'iOS native', 'Android native'].map((tech, i) => <span key={tech} style={{ border: '1px solid #91a37d50', color: '#637753', padding: '11px 21px', borderRadius: 30, fontSize: 18, opacity: interpolate(f, [28 + i * 4, 40 + i * 4], [0,1],clamp) }}>{tech}</span>)}</div>
  </AbsoluteFill>;
}

function Enough() {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: colors.lavender, color: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'absolute', width: 1200, height: 700, borderRadius: '50%', background: 'radial-gradient(ellipse, #e7def775, transparent 70%)', top: 220, left: 450 }} />
    <Lift delay={2} style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: -50 }}><BrandMark className="closing-mark" /><style>{'.closing-mark{width:54px;height:54px;color:#b29aca;--mark-ink:#69517f}'}</style><span style={{ fontSize: 42, fontWeight: 600, letterSpacing: -2 }}>decent<span style={{ fontWeight: 400 }}>devs</span>.</span></Lift>
    <Lift delay={8}><div style={{ display: 'flex', alignItems: 'baseline', fontSize: 186, lineHeight: 1.15, letterSpacing: -12, wordSpacing: 12, fontWeight: 550, marginTop: 35 }}>Good enough<span style={{ color: '#a18ab8' }}>.</span><span style={{ fontSize: 83, marginLeft: 23, alignSelf: 'flex-start', color: '#9d80ba', transform: `rotate(${interpolate(f,[8,60],[-15,18],clamp)}deg)`, letterSpacing: 0 }}>✳</span></div></Lift>
    <Lift delay={23}><div style={{ fontSize: 30, color: '#7d6591', marginTop: 25 }}>Biraz merak. Bolca özen.</div></Lift>
    <Lift delay={37} style={{ position: 'absolute', bottom: 122 }}><div style={{ fontSize: 22, color: '#957ba9', letterSpacing: -.5 }}>decentdevs.com <span style={{ marginLeft: 12 }}>↗</span></div></Lift>
  </AbsoluteFill>;
}

export function DecentFilm() {
  return <AbsoluteFill className="film-root" style={{ background: colors.lavender }}><Fonts /><Audio src={staticFile('audio/studio-score.wav')} />
    <Sequence from={0} durationInFrames={96}><Idea /></Sequence>
    <Sequence from={96} durationInFrames={99}><Draft /></Sequence>
    <Sequence from={195} durationInFrames={150}><Craft /></Sequence>
    <Sequence from={345} durationInFrames={135}><Everywhere /></Sequence>
    <Sequence from={480} durationInFrames={120}><Enough /></Sequence>
  </AbsoluteFill>;
}

function SocialCard() {
  return <AbsoluteFill className="film-root" style={{ background: '#111113', color: '#f5f4f1', padding: 65 }}><Fonts /><div style={{ display: 'flex', alignItems: 'center', gap: 13, fontSize: 28, letterSpacing: -1 }}><BrandMark className="social-mark" /><style>{'.social-mark{width:42px;height:42px;color:#d5f5a1}'}</style>decentdevs.</div><div style={{ fontSize: 128, letterSpacing: -9, marginTop: 78, fontWeight: 600 }}>Good enough<span style={{ color: colors.lime }}>.</span></div><div style={{ fontSize: 25, color: '#a9a0b4', marginTop: 22 }}>İyi görünen, iyi çalışan web siteleri ve uygulamalar.</div><div style={{ position: 'absolute', right: 74, top: 59, fontSize: 62, transform: 'rotate(16deg)', color: '#c9b7f7' }}>✳</div><div style={{ position: 'absolute', bottom: 56, left: 66, fontSize: 17, color: '#74707d' }}>WEB · MOBİL · ÖZEL YAZILIM</div></AbsoluteFill>;
}

function AppIcon() { return <AbsoluteFill style={{ background: '#111113', color: '#d5f5a1', padding: 9 }}><BrandMark /></AbsoluteFill>; }

export function RemotionRoot() {
  return <><Composition id="DecentFilm" component={DecentFilm} durationInFrames={600} fps={30} width={1920} height={1080} /><Composition id="SocialCard" component={SocialCard} durationInFrames={1} fps={30} width={1200} height={630} /><Composition id="AppIcon" component={AppIcon} durationInFrames={1} fps={30} width={180} height={180} /></>;
}
