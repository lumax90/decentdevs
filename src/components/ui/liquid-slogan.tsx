'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import LiquidGlassCursor from './liquid-glass-cursor';
import styles from './liquid-slogan.module.css';

function SloganLines() {
  return <>
    <span className={styles.firstLine}><span>Good </span><em className={styles.secret} aria-hidden="true" data-slogan-secret>is not</em></span>
    <span className={styles.secondLine}>enough<span className={styles.period}>.</span></span>
  </>;
}

export function LiquidSlogan({ id, className, headingClassName, before, after, lensAfter }: {
  id: string;
  className?: string;
  headingClassName?: string;
  before?: ReactNode;
  after?: ReactNode;
  lensAfter?: ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = matchMedia('(max-width: 700px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return <LiquidGlassCursor
    className={cn(styles.scope, className)} bgColor="transparent" lensBgColor="var(--world-bg)" activeSelector="[data-glass-trigger]"
    size={compact ? 116 : 150} textHoverSize={compact ? 116 : 146} magnification={1.15} distortion={24} aberration={.12}
    maxButtonWidth={150} maxButtonHeight={150}
    keyboardLabel="Slogandaki ayrıntıyı keşfet. Ok tuşlarıyla merceği gezdir, Escape ile kapat."
    lensContent={<>{before}<div className={cn(styles.surface, headingClassName)}><div className={styles.heading}><SloganLines /></div></div>{lensAfter ?? after}</>}
  >
    {before}
    <div className={cn(styles.surface, headingClassName)} data-glass-trigger data-cursor="text">
      <h1 id={id} className={styles.heading} aria-label="Good enough."><SloganLines /></h1>
    </div>
    {after}
  </LiquidGlassCursor>;
}
