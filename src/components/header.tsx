'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './brand';

export function Header() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.close(); }, [pathname]);

  return <>
    <a href="#icerik" className="skip-link">İçeriğe geç</a>
    <header className="site-header">
      <div className="nav-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Ana menü">
          <Link href="/#oyun-alani" prefetch={false}>Oyun alanı</Link>
          <Link href="/#neler-yapiyoruz" prefetch={false}>Neler yapıyoruz?</Link>
          <Link href="/#yaklasim" prefetch={false}>Bizce</Link>
        </nav>
        <div className="nav-actions">
          <Link className="button button-small button-white" href="/baslayalim" prefetch={false}>Fikrini anlat <ArrowUpRight size={16} /></Link>
          <button type="button" className="icon-button menu-toggle" aria-label="Menüyü aç" onClick={() => dialog.current?.showModal()}><Menu size={22} /></button>
        </div>
      </div>
    </header>
    <dialog className="mobile-menu" ref={dialog} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="mobile-menu-inner">
        <div className="mobile-menu-top"><Brand /><button type="button" className="icon-button" aria-label="Menüyü kapat" onClick={() => dialog.current?.close()}><X /></button></div>
        <nav aria-label="Mobil menü">
          <Link onClick={() => dialog.current?.close()} href="/#oyun-alani" prefetch={false}>Oyun alanı <ArrowUpRight /></Link>
          <Link onClick={() => dialog.current?.close()} href="/#neler-yapiyoruz" prefetch={false}>Neler yapıyoruz? <ArrowUpRight /></Link>
          <Link onClick={() => dialog.current?.close()} href="/#yaklasim" prefetch={false}>Bizce <ArrowUpRight /></Link>
          <Link onClick={() => dialog.current?.close()} href="/baslayalim" prefetch={false}>Fikrini anlat <ArrowUpRight /></Link>
        </nav>
        <p>Good enough. <span className="muted">Bizce gayet iyi bir başlangıç.</span></p>
      </div>
    </dialog>
  </>;
}
