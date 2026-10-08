'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Play, X } from 'lucide-react';
import { tourMedia, type TourStop } from '@/lib/world-tour';
import styles from './tour-window.module.css';

interface TourWindowProps {
  stop: TourStop;
  nextLabel: string;
  active: boolean;
  playing: boolean;
  finished: boolean;
  onEnded: () => void;
  onClose: () => void;
  onNext: () => void;
  onPlay: () => void;
  onHold: (held: boolean) => void;
}

export default function TourWindow({ stop, nextLabel, active, playing, finished, onEnded, onClose, onNext, onPlay, onHold }: TourWindowProps) {
  const video = useRef<HTMLVideoElement>(null);
  const windowRef = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const focused = useRef(false);
  const inView = useRef(false);
  const [visible, setVisible] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const reportedFailure = useRef(false);
  const finishedCallback = useRef(onEnded);
  finishedCallback.current = onEnded;
  const media = tourMedia(stop.scene);
  const failMedia = useCallback(() => {
    if (reportedFailure.current || !video.current?.isConnected) return;
    reportedFailure.current = true;
    setFailed(true);
    setBlocked(false);
    finishedCallback.current();
  }, []);
  const playMedia = useCallback(() => {
    const node = video.current;
    if (!node) return;
    if (node.error) { failMedia(); return; }
    void node.play().then(() => { if (node.isConnected) setBlocked(false); }).catch((error: DOMException) => {
      if (!node.isConnected) return;
      if (node.error || error.name === 'NotSupportedError') failMedia();
      else if (error.name !== 'AbortError') setBlocked(true);
    });
  }, [failMedia]);
  const syncPlayback = useCallback(() => {
    const node = video.current;
    if (!node) return;
    if (active && visible && playing && !finished && !failed) playMedia();
    else node.pause();
  }, [active, visible, playing, finished, failed, playMedia]);

  useEffect(syncPlayback, [syncPlayback]);
  useEffect(() => {
    focused.current = !!windowRef.current?.contains(document.activeElement);
    onHold(focused.current || !inView.current);
  }, [playing, blocked, finished, failed, onHold]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting && entry.intersectionRatio >= 0.3;
      setVisible(inView.current);
      onHold(focused.current || !inView.current);
    }, { threshold: [0, 0.3] });
    if (windowRef.current) observer.observe(windowRef.current);
    return () => observer.disconnect();
  }, [onHold]);
  useEffect(() => {
    const node = video.current;
    return () => {
      node?.pause();
      // Release the decoder and buffered frames after a real unmount. React's
      // development effect replay keeps the element connected.
      if (node && !node.isConnected) { node.removeAttribute('src'); node.load(); }
      onHold(false);
    };
  }, [onHold]);

  return <aside
    ref={windowRef}
    className={styles.window} data-tour-preview={stop.location}
    aria-label={`${stop.label} deneyimi`}
    style={{ '--stop-color': stop.color } as CSSProperties}
    onFocusCapture={() => { focused.current = true; onHold(true); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) { focused.current = false; onHold(!inView.current); } }}
    onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); } }}
  >
    <div className={styles.top}>
      <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>
      <span className={styles.label}>{stop.label}</span>
      <button type="button" onClick={onClose} aria-label="Durak penceresini kapat"><X size={14} /></button>
    </div>
    <div className={styles.screen}>
      <video
        ref={video} src={media.src} poster={media.poster} muted playsInline preload="auto"
        controlsList="nodownload" disablePictureInPicture aria-label={stop.description}
        onLoadedData={syncPlayback}
        onTimeUpdate={() => { if (progress.current && video.current) progress.current.style.transform = `scaleX(${Math.min(1, video.current.currentTime / media.duration)})`; }}
        onEnded={onEnded}
        onError={failMedia}
      />
      {!failed && !finished && (!playing || blocked) && <button type="button" className={styles.play} aria-label={`${stop.label} animasyonunu oynat`} onClick={() => { onPlay(); playMedia(); }}><Play size={20} fill="currentColor" /></button>}
      {failed && <div className={styles.error}><span>Bu görüntü yüklenemedi.</span><button type="button" onClick={onNext}>Sıradaki durağa geç <ArrowRight size={14} /></button></div>}
    </div>
    <div className={styles.progress} aria-hidden="true"><span ref={progress} /></div>
    <div className={styles.bottom}>
      <h3>{stop.title}</h3>
      <button type="button" onClick={onNext} aria-label={`Sonraki durak: ${nextLabel}`} title={`Sonraki: ${nextLabel}`}><ArrowRight size={17} /></button>
    </div>
  </aside>;
}
