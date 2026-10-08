'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Check, Code2, Compass, Gamepad2, Globe2, Layers, MapPin, MoveHorizontal, Pause, Play, RotateCcw, Smartphone } from 'lucide-react';
import { FilmButton } from '@/components/film';
import { heroDestinations, heroMapLocations, type HeroDestinationId, type HeroLocationId } from '@/lib/hero-destinations';
import { tourStopFor } from '@/lib/world-tour';
import { cn } from '@/lib/utils';
import { createMotion, stopMomentum } from './orbit/state';
import { useWorldTour } from './orbit/use-world-tour';
import styles from './orbit-delivery-hero.module.css';

const PlanetScene = dynamic(() => import('./orbit/planet-scene'), { ssr: false });
const TourWindow = dynamic(() => import('./orbit/tour-window'), { ssr: false });
const icons = { website: Globe2, webapp: Code2, mobile: Smartphone, game: Gamepad2, internal: Layers };
type SceneStatus = 'loading' | 'ready' | 'error';

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export interface OrbitDeliveryHeroProps {
  className?: string;
  theme?: 'auto' | 'dark' | 'light';
  assetBaseUrl?: string;
}

export default function OrbitDeliveryHero({ className, theme = 'dark', assetBaseUrl = '/hero/' }: OrbitDeliveryHeroProps) {
  const id = useId();
  const motion = useRef(createMotion());
  const stage = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef<{ id: number; x: number; y: number; touch: boolean } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<SceneStatus>('loading');
  const [projectChoice, setProjectChoice] = useState<HeroDestinationId | null>(null);
  const [popupHeld, setPopupHeld] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ready = status === 'ready';
  const active = visible && tabVisible && !dialogOpen;
  const effectivelyReduced = reduced && !playing;
  const tour = useWorldTour(motion, { ready, active, playing, reduced: effectivelyReduced, dragging, held: popupHeld || pinFocused });
  const { target: selected, arrived, visit: revision, mode, phase } = tour.state;
  const destination = heroDestinations.find(item => item.id === selected);
  const stop = tourStopFor(selected);
  const nextStop = tour.next;

  const release = useCallback(() => {
    const previous = drag.current;
    drag.current = null;
    motion.current.dragging = false;
    motion.current.lastInteraction = motion.current.time;
    setDragging(false);
    if (previous && stage.current?.hasPointerCapture(previous.id)) stage.current.releasePointerCapture(previous.id);
  }, []);
  const onReady = useCallback(() => setStatus('ready'), []);
  const onFailure = useCallback(() => { setStatus('error'); release(); tour.manual(); }, [release, tour.manual]);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => { setReduced(query.matches); setPlaying(!query.matches); if (query.matches) tour.manual(); };
    preference();
    query.addEventListener('change', preference);
    const visibility = () => { setTabVisible(!document.hidden); if (document.hidden) release(); };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    const observeDialogs = () => setDialogOpen(!!document.querySelector('dialog[open]'));
    const dialogs = new MutationObserver(observeDialogs);
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    observeDialogs();
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) release();
    }, { threshold: 0.01 });
    if (stage.current) observer.observe(stage.current);
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => setMounted(true)); });
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', visibility);
      dialogs.disconnect();
      observer.disconnect();
    };
  }, [release, tour.manual]);

  function choose(id: HeroLocationId | null) {
    release();
    tour.manual(id);
    setProjectChoice(heroDestinations.find(destination => destination.id === id)?.id ?? null);
    setPopupHeld(false);
    if (!reduced) setPlaying(true);
  }

  function toggleTour() {
    release();
    setPopupHeld(false);
    setProjectChoice(null);
    if (mode === 'auto') tour.manual();
    else { tour.start(); setPlaying(true); }
  }

  function closePreview() {
    choose(null);
    stage.current?.focus({ preventScroll: true });
  }

  function nextPreview() {
    release();
    setPopupHeld(false);
    setProjectChoice(null);
    tour.skip();
    setPlaying(true);
    stage.current?.focus({ preventScroll: true });
  }

  function toggleMotion() {
    const next = !playing;
    release();
    stopMomentum(motion.current);
    if (next) {
      motion.current.lastInteraction = motion.current.time - 4;
    }
    setPlaying(next);
  }

  return <section className={cn(styles.hero, className)} data-theme={theme} aria-labelledby={`${id}-heading`}>
    <div className={styles.inner}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}><span /> İyi fikirlere zaafımız var.</p>
        <h1 id={`${id}-heading`} className={styles.heading}><span>Good </span><span>enough<span className={styles.period}>.</span></span></h1>
        <p className={styles.description}>İyi görünen. İyi çalışan.<br />Senin dünyana uyan yazılımlar.</p>
        <p className={styles.aside}>Biraz merak. Bolca özen.</p>
        <div className={styles.actions}>
          <Link className="button button-lime" href={projectChoice && mode === 'manual' ? `/baslayalim?tur=${projectChoice}` : '/baslayalim'} prefetch={false}>Fikrini anlat <ArrowUpRight size={18} /></Link>
          <FilmButton />
        </div>
        <a className={styles.scrollLink} href="#oyun-alani"><span>Biraz da yaptıklarımıza bak.</span><ArrowDown size={14} /></a>
      </div>

      <div ref={visual} className={styles.visual}>
        <div className={styles.worldNote} aria-hidden="true"><span>Fikrin nereye,<br />biz oraya.</span><ArrowUpRight size={25} strokeWidth={1} /></div>
        <div
          ref={stage} className={cn(styles.stage, dragging && styles.dragging)}
          role="group" tabIndex={0} aria-label="Decent Devs’in etkileşimli dünyası"
          aria-roledescription="etkileşimli 3B küre" aria-describedby={`${id}-instructions`}
          data-scene-state={status} data-motion={playing ? 'running' : 'paused'} data-destination={selected || 'explore'} data-tour-mode={mode} data-tour-phase={phase}
          onPointerDown={event => {
            if (!ready || !playing || !event.isPrimary || event.button !== 0) return;
            choose(null);
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType === 'touch' };
            motion.current.dragging = true;
            motion.current.lastInteraction = motion.current.time;
            setDragging(true);
          }}
          onPointerMove={event => {
            const pointer = drag.current;
            if (!playing || pointer?.id !== event.pointerId) return;
            const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
            const sensitivity = 5 / Math.max(360, event.currentTarget.clientWidth);
            const m = motion.current;
            m.dragTarget = Math.max(m.planetAngle - 0.5, Math.min(m.planetAngle + 0.5, m.dragTarget + dx * sensitivity));
            if (!pointer.touch) m.pitchTarget = Math.max(m.pitchAngle - 0.4, Math.min(m.pitchAngle + 0.4, m.pitchTarget + dy * sensitivity * 0.7));
            pointer.x = event.clientX; pointer.y = event.clientY;
            m.lastInteraction = m.time;
          }}
          onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
          onKeyDown={event => {
            if (event.key === 'Escape' && tour.preview) { event.preventDefault(); closePreview(); return; }
            if (event.key === ' ') { event.preventDefault(); if (!event.repeat) toggleMotion(); }
            if (!playing || !ready || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
            event.preventDefault();
            choose(null);
            const m = motion.current;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') m.planetVelocity += event.key === 'ArrowRight' ? 0.65 : -0.65;
            else m.pitchVelocity += event.key === 'ArrowDown' ? 0.4 : -0.4;
            m.lastInteraction = m.time;
          }}
        >
          <div className={styles.halo} aria-hidden="true" />
          <div className={cn(styles.poster, ready && styles.posterHidden)} aria-hidden="true">
            <div className={styles.placeholderGlobe} />
            <picture>
              <source media="(max-width: 700px)" srcSet="/hero/world-closeup-mobile.webp" />
              <img src="/hero/world-closeup.webp" width={742} height={600} alt="" fetchPriority="low" />
            </picture>
          </div>
          <div className={cn(styles.canvas, ready && styles.canvasReady)}>
            {mounted && status !== 'error' && <SceneBoundary key={`${assetBaseUrl}-${attempt}`} onFailure={onFailure}>
              <PlanetScene motion={motion} labels={labels} anchor={visual} active={active} playing={playing} reduced={effectivelyReduced} discovering={mode === 'manual' && phase === 'waiting' && playing} selected={selected} revision={revision} assetBaseUrl={`${assetBaseUrl.replace(/\/$/, '')}/`} onReady={onReady} onArrival={tour.arrive} onDiscover={tour.discover} onFailure={onFailure} />
            </SceneBoundary>}
          </div>
          <div className={styles.mapLabels} data-ready={ready} role="group" aria-label="Dünya üzerindeki konumlar">
            {heroMapLocations.map((item, index) => <button
              type="button" tabIndex={-1} aria-label={`${item.label} konumunu keşfet`}
              ref={node => { labels.current[index] = node; }} key={item.id}
              className={styles.mapLabel} data-location={item.id} data-kind={item.kind}
              data-selected={selected === item.id} style={{ '--destination-color': item.color } as CSSProperties}
              onPointerDown={event => event.stopPropagation()}
              onPointerEnter={event => { if (mode === 'manual' && event.pointerType === 'mouse') motion.current.hoveredLocation = item.id; }}
              onPointerMove={event => { event.stopPropagation(); if (mode === 'manual' && event.pointerType === 'mouse') motion.current.hoveredLocation = item.id; }}
              onPointerLeave={() => { if (motion.current.hoveredLocation === item.id) motion.current.hoveredLocation = null; }}
              onFocus={event => { if (event.currentTarget.matches(':focus-visible')) { if (mode === 'auto') choose(null); setPinFocused(true); } }}
              onBlur={() => setPinFocused(false)}
              onKeyDown={event => event.stopPropagation()}
              onClick={event => { event.stopPropagation(); choose(item.id); }}
            ><span className={styles.location}><span className={styles.locationName}>{item.label}</span><span className={styles.pinWrap}><MapPin className={styles.locationPin} size={24} strokeWidth={1.8} /><svg className={styles.dwellRing} viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" pathLength="1" /></svg></span></span></button>)}
          </div>
          <div className={styles.horizonFade} aria-hidden="true" />
        </div>

        {tour.preview && <TourWindow key={revision} stop={tour.preview} nextLabel={nextStop.label} active={active} playing={playing && !effectivelyReduced} finished={phase === 'departing'} onEnded={() => tour.ended(revision)} onClose={closePreview} onNext={nextPreview} onPlay={() => setPlaying(true)} onHold={setPopupHeld} />}

        <div className={styles.worldFooter}>
          <div className={styles.routeStatus} role="status" aria-live="polite" aria-atomic="true">
            {mode === 'auto' ? <><span style={{ color: stop?.color || 'var(--lime)' }}><Compass size={13} /> KEŞİF TURU</span><p>{phase === 'waiting' ? 'İlk durak: oyun. Gel, gezelim.' : arrived ? `${stop?.label || 'Bu'} durağında küçük bir mola.` : `${stop?.label || 'Yeni fikirler'} yönünde, merakın peşinde.`}</p></> : stop ? <><span style={{ color: stop.color }}>{arrived || effectivelyReduced ? <Check size={13} /> : <ArrowUpRight size={13} />}{arrived || effectivelyReduced ? 'DOĞRU YERDESİN.' : 'ROTAMIZ BELLİ.'}</span><p>{destination?.note || stop.title}</p></> : <><span><MoveHorizontal size={13} /> KONTROL SENDE.</span><p>Bir konuma yaklaş. Kısa bir mola ver.</p></>}
          </div>
          <div className={styles.worldControls}>
            {ready && <button type="button" className={styles.motionButton} aria-pressed={mode === 'auto'} aria-label={mode === 'auto' ? 'Tur açık: keşif turunu durdur' : 'Tura dön: keşif turunu başlat'} onClick={toggleTour}><Compass size={14} /><span>{mode === 'auto' ? 'Tur' : 'Tura dön'}</span></button>}
            {status === 'error' ? <button type="button" className={styles.motionButton} aria-label="3B dünyayı tekrar yükle" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}><RotateCcw size={14} /><span>Tekrar yükle</span></button> : <button type="button" className={styles.motionButton} onClick={toggleMotion} aria-pressed={!playing} aria-label={playing ? 'Bir mola: hareketi duraklat ve selam ver' : 'Devam: hareketi başlat'}>{playing ? <Pause size={14} /> : <Play size={14} />}<span>{playing ? 'Bir mola' : 'Devam'}</span></button>}
          </div>
        </div>
        {!ready && <p className={styles.loading} role="status">{status === 'error' ? 'Küçük dünya şu an dinleniyor. Yine de yönünü seçebilirsin.' : 'Küçük dünyamız hazırlanıyor…'}</p>}
        <p id={`${id}-instructions`} className="sr-only">Dünyayı sürükle veya ok tuşlarıyla çevir. Karakteri bir konuma yaklaştırıp kısa süre beklersen o konumun canlandırması açılır. Konum işaretlerine tıklayabilir ya da Enter ile seçebilirsin. Keşif bulunduğun yerden yakındaki konumlarla devam eder. Boşluk hareketi duraklatır, Escape pencereyi kapatır. Telefonda yatay sürükleme küreyi, dikey kaydırma sayfayı hareket ettirir.</p>
      </div>

      <div className={styles.destinationPicker}>
        <div className={styles.pickerHeading}><span>AKLINDAKİ HANGİ DÜNYA?</span><p>Yönü sen belirle.</p></div>
        <div className={styles.destinations} role="group" aria-label="Projenin yönünü seç">
          {heroDestinations.map(item => {
            const Icon = icons[item.id];
            return <button type="button" key={item.id} aria-pressed={selected === item.id} onClick={() => choose(item.id)} style={{ '--destination-color': item.color } as CSSProperties}><Icon size={18} strokeWidth={1.5} /><span>{item.label}</span><ArrowUpRight className={styles.destinationArrow} size={14} /></button>;
          })}
        </div>
      </div>
    </div>
  </section>;
}
