'use client';

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { BrandMark } from './brand';
import { whatsappCopy } from '@/lib/whatsapp';
import styles from './whatsapp-contact.module.css';

function WhatsAppMark() {
  // Bootstrap Icons (MIT): public/licenses/bootstrap-icons.txt
  return <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>;
}

function ContactPanel({ id, href, action, onClose }: { id: string; href: string; action: RefObject<HTMLAnchorElement | null>; onClose: () => void }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return <motion.div
    id={`${id}-panel`} className={styles.panel} role="dialog" aria-modal="false"
    aria-labelledby={`${id}-title`} aria-describedby={`${id}-greeting`}
    aria-hidden={!present || undefined} inert={!present}
    initial={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : .975 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: reduced ? 0 : 6, scale: reduced ? 1 : .985, transition: { duration: reduced ? 0 : .16 } }}
    transition={{ duration: reduced ? 0 : .28, ease: [.22, 1, .36, 1] }}
  >
    <div className={styles.header}>
      <BrandMark className={styles.brandMark} />
      <div><span className={styles.brandName}>decent<span>devs.</span></span><p>İyi fikirlere yer var.</p></div>
      <button type="button" className={styles.close} onClick={onClose} aria-label="İletişim penceresini kapat"><X size={17} /></button>
    </div>
    <motion.div className={styles.content}
      initial={{ opacity: 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : .24, delay: reduced ? 0 : .045 }}
    >
      <h2 id={`${id}-title`}>Bir merhabayla başlar<span>.</span></h2>
      <p id={`${id}-greeting`} className={styles.greeting}>{whatsappCopy.greeting}</p>
      <a ref={action} className={styles.action} href={href} target="_blank" rel="noopener noreferrer"><WhatsAppMark /><span>WhatsApp’tan yaz</span><ArrowUpRight size={17} /></a>
    </motion.div>
  </motion.div>;
}

export function WhatsAppContact({ href }: { href: string }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const action = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) launcher.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => action.current?.focus({ preventScroll: true }));
    const outside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && root.current?.contains(document.activeElement)) {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open, close]);

  return <div ref={root} className={styles.contact} data-contact-widget>
    <AnimatePresence initial={false}>
      {open && <ContactPanel key="contact-panel" id={id} href={href} action={action} onClose={() => close(true)} />}
    </AnimatePresence>
    <div className={styles.launcherRow}>
      {!open && <span className={styles.hint} aria-hidden="true">Hızlıca konuşalım.</span>}
      <motion.button ref={launcher} type="button" tabIndex={0} className={styles.launcher} onClick={() => setOpen(value => !value)} aria-label={open ? 'WhatsApp iletişim penceresini kapat' : 'WhatsApp ile iletişim'} aria-expanded={open} aria-controls={open ? `${id}-panel` : undefined} aria-haspopup="dialog"
        whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: .96 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        <AnimatePresence initial={false}>
          <motion.span key={open ? 'close' : 'whatsapp'} className={styles.launcherIcon} aria-hidden="true"
            initial={{ opacity: 0, scale: reduced ? 1 : .8, rotate: reduced ? 0 : -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: reduced ? 1 : .8, rotate: reduced ? 0 : 20 }}
            transition={{ duration: reduced ? 0 : .18, ease: 'easeOut' }}
          >{open ? <X size={23} /> : <WhatsAppMark />}</motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  </div>;
}
