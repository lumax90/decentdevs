'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import { Play, X } from 'lucide-react';

const FilmContext = createContext<() => void>(() => {});
const studioFilm = {
  src: '/film/intro/music-previews/decent-devs-digital-gravity-voice-music.mp4?v=04-1',
  poster: '/film/intro/poster-04.jpg',
  captions: '/film/intro/decent-devs-intro-markus-v4.vtt',
};

export function FilmProvider({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const show = useCallback(() => {
    flushSync(() => setOpen(true));
    dialog.current?.showModal();
    if (video.current) {
      video.current.currentTime = 0;
      void video.current.play().catch(() => {});
    }
  }, []);
  const close = () => { video.current?.pause(); dialog.current?.close(); setOpen(false); };
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <FilmContext.Provider value={show}>
    {children}
    <dialog className="film-dialog" aria-label="Decent Devs stüdyo filmi" ref={dialog} onCancel={close} onClose={() => { video.current?.pause(); setOpen(false); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="film-dialog-inner">
        <div className="film-dialog-heading"><span>decent devs <span className="muted">/ bir fikrin yolculuğu</span></span><button type="button" className="icon-button" onClick={close} aria-label="Filmi kapat" autoFocus><X /></button></div>
        {open && <video ref={video} controls controlsList="nodownload" playsInline preload="none" poster={studioFilm.poster} aria-label="Bir fikrin taslaktan test edilmiş web, mobil ve kurumsal ürüne dönüşmesini anlatan film">
          <source src={studioFilm.src} type="video/mp4" />
          <track kind="captions" src={studioFilm.captions} srcLang="tr" label="Türkçe" />
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>}
        <div className="film-dialog-bottom"><p>Bir fikir. Doğru araçlar. Biraz insan dokunuşu.</p></div>
      </div>
    </dialog>
  </FilmContext.Provider>;
}

export function FilmButton({ className = 'button button-ghost', children = 'Nasıl mı?' }: { className?: string; children?: React.ReactNode }) {
  const show = useContext(FilmContext);
  return <button type="button" className={className} onClick={show}><Play size={15} fill="currentColor" />{children}</button>;
}

export function FilmCard() {
  const show = useContext(FilmContext);
  return <button type="button" className="film-card" onClick={show} aria-label="Bir fikrin yolculuğu: stüdyo filmini izle">
    <div className="film-poster-backdrop" />
    {/* A generated Remotion still; the typographic layer also works before rendering. */}
    <picture>
      <source media="(max-width: 700px)" srcSet="/film/intro/poster-04-mobile.webp" />
      <Image src={studioFilm.poster} alt="Good enough. — Decent Devs stüdyo filminden bir kare" width={1920} height={1080} sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1150px) calc(100vw - 64px), (max-width: 1296px) calc(100vw - 96px), 1200px" />
    </picture>
    <span className="film-card-label"><span className="tiny-dot" /> BİR FİKRİN YOLCULUĞU</span>
    <span className="film-play"><Play size={23} fill="currentColor" /><span>Filmi izle</span><span className="film-duration">01:00</span></span>
    <span className="film-card-note">Kulaklıkla biraz daha güzel.</span>
  </button>;
}
