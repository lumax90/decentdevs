import { AbsoluteFill, Audio, Composition, Sequence, useCurrentFrame } from 'remotion';
import { staticFile } from 'remotion';
import script from './script.json';
import timingData from './timing.json';
import { Architecture, Craft, Delivery, Design, Reality, Signature, Start } from './scenes';
import { ChapterContext, IntroFonts, phase, type Timing } from './shared';
import './style.css';

const timing = timingData as Timing;
const scenes = { start: Start, reality: Reality, design: Design, architecture: Architecture, craft: Craft, delivery: Delivery, signature: Signature };

function SceneWipe({ children, first }: { children: React.ReactNode; first: boolean }) {
  const frame = useCurrentFrame();
  const reveal = first ? 1 : phase(frame, 0, 19);
  return <AbsoluteFill style={{ clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)` }}>{children}</AbsoluteFill>;
}

export function IntroFilm({ narrated = true, captions = true }: { narrated?: boolean; captions?: boolean }) {
  const frame = useCurrentFrame();
  if (narrated && !timing.ready) throw new Error('Ses henüz hazır değil. intro:narrate ve intro:prepare çalıştırın; görsel çalışma için DecentIntroAnimatic seçilebilir.');
  const t = frame / timing.fps;
  const caption = timing.captions.find(c => t >= c.start && t < c.end);
  return <AbsoluteFill className="intro-film"><IntroFonts />
    {narrated && <Audio src={staticFile('film/intro/master.wav')} />}
    {timing.chapters.map((chapter, i) => {
      const Scene = scenes[chapter.id as keyof typeof scenes];
      return <Sequence key={chapter.id} from={chapter.from} durationInFrames={Math.min(chapter.durationInFrames + 20, timing.durationInFrames - chapter.from)} name={chapter.id}><ChapterContext.Provider value={chapter}><SceneWipe first={i === 0}><Scene /></SceneWipe></ChapterContext.Provider></Sequence>;
    })}
    <div className="grain" />
    {narrated && captions && caption && <div className="intro-caption"><span>{caption.text}</span></div>}
    {!narrated && <div style={{ position: 'absolute', bottom: 19, left: 30, padding: '7px 12px', background: '#101810cc', color: '#fff', fontSize: 13, letterSpacing: 1.2, zIndex: 25 }}>ANİMATİK / SESLENDİRME ÖNİZLEMESİ DEĞİLDİR</div>}
  </AbsoluteFill>;
}

export function IntroRoot() {
  return <><Composition id="DecentIntro" component={IntroFilm} defaultProps={{ narrated: true, captions: true }} fps={script.fps} width={1920} height={1080} durationInFrames={script.durationInFrames} /><Composition id="DecentIntroClean" component={IntroFilm} defaultProps={{ narrated: true, captions: false }} fps={script.fps} width={1920} height={1080} durationInFrames={script.durationInFrames} /><Composition id="DecentIntroAnimatic" component={IntroFilm} defaultProps={{ narrated: false, captions: false }} fps={script.fps} width={1920} height={1080} durationInFrames={script.durationInFrames} /></>;
}
