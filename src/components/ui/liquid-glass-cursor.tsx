// Adapted from Hyperiux Vault: https://vault.hyperiux.com
'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import styles from './liquid-glass-cursor.module.css';

export interface LiquidGlassCursorProps {
  children?: ReactNode;
  /** A presentational copy, for content that needs different ink beneath the glass. */
  lensContent?: ReactNode;
  size?: number;
  magnification?: number;
  textHoverSize?: number;
  maxButtonWidth?: number;
  maxButtonHeight?: number;
  distortion?: number;
  aberration?: number;
  /** Wrapper background. The lens mirrors this surface when magnifying. */
  bgColor?: string;
  /** Backing for a lens above a transparent wrapper. */
  lensBgColor?: string;
  /** Restrict activation while still refracting the whole wrapper's content. */
  activeSelector?: string;
  className?: string;
  /** Enables keyboard exploration without making every cursor wrapper a tab stop. */
  keyboardLabel?: string;
}

const TEXT_SELECTOR = '[data-cursor="text"], p, span, em, h1, h2, h3, h4, h5, h6, label';
const BUTTON_SELECTOR = '[data-cursor="button"], button, a, [role="button"], input, select, textarea';
const directions: Record<string, readonly [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

const isolate = (channel: 0 | 1 | 2) => [0, 1, 2, 3].map(row => {
  const values = [0, 0, 0, 0, 0];
  if (row === 3) values[3] = 1;
  else if (row === channel) values[channel] = 1;
  return values.join(' ');
}).join('  ');

export default function LiquidGlassCursor({
  children, lensContent, size = 150, magnification = 1.15, textHoverSize = 130,
  maxButtonWidth = 260, maxButtonHeight = 110, distortion = 60, aberration = 1,
  bgColor = '#f5f5f7', lensBgColor, activeSelector, className, keyboardLabel,
}: LiquidGlassCursorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const filterId = `lgc-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [copyStyle, setCopyStyle] = useState<CSSProperties>({});
  const [mapUrl, setMapUrl] = useState('');
  const reduceMotion = useReducedMotion();
  const ready = Boolean(mapUrl && dims.width && dims.height);
  const mapSize = Math.ceil(Math.max(size, textHoverSize, maxButtonWidth, maxButtonHeight));

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const presence = useMotionValue(0);
  const targetW = useMotionValue(size);
  const targetH = useMotionValue(size);
  const sx = useSpring(x, { stiffness: 300, damping: 26 });
  const sy = useSpring(y, { stiffness: 300, damping: 26 });
  const scale = useSpring(presence, { stiffness: 260, damping: 24 });
  const sw = useSpring(targetW, { stiffness: 340, damping: 28 });
  const sh = useSpring(targetH, { stiffness: 340, damping: 28 });
  // With reduced motion, tracking is direct: no trailing, morphing or spring-in.
  const px = reduceMotion ? x : sx;
  const py = reduceMotion ? y : sy;
  const width = reduceMotion ? targetW : sw;
  const height = reduceMotion ? targetH : sh;
  const lensScale = reduceMotion ? presence : scale;

  const hide = useCallback(() => {
    presence.set(0);
    if (ref.current?.dataset.glassActive === 'true') ref.current.dataset.glassActive = 'false';
    targetW.set(size);
    targetH.set(size);
  }, [presence, targetW, targetH, size]);

  function isActiveTarget(target: EventTarget | null) {
    return !activeSelector || target instanceof Element && !!target.closest(activeSelector);
  }

  function activationBounds() {
    const surface = ref.current;
    const target = activeSelector ? surface?.querySelector(activeSelector) : surface;
    if (!surface || !target) return { x: 0, y: 0, width: dims.width, height: dims.height };
    const outer = surface.getBoundingClientRect(), inner = target.getBoundingClientRect();
    return { x: inner.left - outer.left, y: inner.top - outer.top, width: inner.width, height: inner.height };
  }

  function setShapeForTarget(target: EventTarget | null) {
    const element = target instanceof Element ? target : null;
    const button = element?.closest(BUTTON_SELECTOR);
    const text = element?.closest(TEXT_SELECTOR);
    targetW.set(button ? maxButtonWidth : text ? textHoverSize : size);
    targetH.set(button ? maxButtonHeight : text ? textHoverSize : size);
  }

  function track(left: number, top: number) {
    // Enter at the pointer, rather than flying in from the last hover position.
    if (!presence.get()) { sx.jump(left); sy.jump(top); }
    x.set(left);
    y.set(top);
    presence.set(1);
    if (ref.current && ref.current.dataset.glassActive !== 'true') ref.current.dataset.glassActive = 'true';
  }

  // Generate the radial displacement bitmap once, then stretch it with the lens.
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = mapSize;
    const context = canvas.getContext('2d');
    if (!context) return;
    const image = context.createImageData(mapSize, mapSize);
    const center = mapSize / 2;
    for (let row = 0; row < mapSize; row++) for (let column = 0; column < mapSize; column++) {
      const dx = column - center, dy = row - center;
      const distance = Math.hypot(dx, dy);
      const strength = Math.min(distance / center, 1) ** 3;
      const ux = distance ? dx / distance : 0, uy = distance ? dy / distance : 0;
      const index = (row * mapSize + column) * 4;
      image.data[index] = Math.round(255 * (0.5 - 0.5 * ux * strength));
      image.data[index + 1] = Math.round(255 * (0.5 - 0.5 * uy * strength));
      image.data[index + 2] = 128;
      image.data[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    const url = canvas.toDataURL();
    const frame = requestAnimationFrame(() => setMapUrl(url));
    return () => cancelAnimationFrame(frame);
  }, [mapSize]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let previousWidth = 0, previousHeight = 0;
    const observer = new ResizeObserver(() => {
      const bounds = element.getBoundingClientRect();
      if (previousWidth && (Math.abs(bounds.width - previousWidth) > .5 || Math.abs(bounds.height - previousHeight) > .5)) hide();
      previousWidth = bounds.width; previousHeight = bounds.height;
      setDims({ width: bounds.width, height: bounds.height });
      const computed = getComputedStyle(element);
      setCopyStyle({
        backgroundColor: lensBgColor ?? computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        backgroundSize: computed.backgroundSize,
        backgroundPosition: computed.backgroundPosition,
        padding: computed.padding,
        boxSizing: 'border-box',
      });
    });
    observer.observe(element);
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', hide);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [hide, lensBgColor]);

  const lensX = useTransform([px, width], ([value, w]) => (value as number) - (w as number) / 2);
  const lensY = useTransform([py, height], ([value, h]) => (value as number) - (h as number) / 2);
  const shadowX = useTransform([px, width], ([value, w]) => (value as number) - (w as number) / 2 + 8);
  const shadowY = useTransform([py, height], ([value, h]) => (value as number) - (h as number) / 2 + 12);
  const copyX = useTransform([px, width], ([value, w]) => (w as number) / 2 - magnification * (value as number));
  const copyY = useTransform([py, height], ([value, h]) => (h as number) / 2 - magnification * (value as number));

  return <div
    ref={ref} className={cn(styles.surface, className)} style={{ backgroundColor: bgColor }}
    data-glass-cursor data-glass-ready={ready}
    tabIndex={keyboardLabel ? 0 : undefined} role={keyboardLabel ? 'group' : undefined} aria-label={keyboardLabel}
    onPointerMove={event => {
      if (!isActiveTarget(event.target)) { hide(); return; }
      if (!ready || (event.pointerType !== 'mouse' && !event.buttons)) return;
      const rect = event.currentTarget.getBoundingClientRect();
      track(event.clientX - rect.left, event.clientY - rect.top);
      setShapeForTarget(event.target);
    }}
    onPointerDown={event => {
      if (!ready || !event.isPrimary || !isActiveTarget(event.target)) return;
      const rect = event.currentTarget.getBoundingClientRect();
      track(event.clientX - rect.left, event.clientY - rect.top);
      setShapeForTarget(event.target);
    }}
    onPointerUp={event => { if (event.pointerType !== 'mouse') hide(); }}
    onPointerLeave={hide} onPointerCancel={hide}
    onFocus={event => {
      if (ready && event.currentTarget === event.target && event.currentTarget.matches(':focus-visible')) {
        const bounds = activationBounds();
        track(bounds.x + bounds.width * .68, bounds.y + bounds.height * .3);
        targetW.set(textHoverSize); targetH.set(textHoverSize);
      }
    }}
    onBlur={hide}
    onKeyDown={event => {
      if (!keyboardLabel || !ready) return;
      if (event.key === 'Escape') { event.preventDefault(); hide(); return; }
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const bounds = activationBounds();
      track(Math.max(bounds.x, Math.min(bounds.x + bounds.width, x.get() + direction[0] * 24)), Math.max(bounds.y, Math.min(bounds.y + bounds.height, y.get() + direction[1] * 24)));
      targetW.set(textHoverSize); targetH.set(textHoverSize);
    }}
  >
    {children}
    <svg className={styles.definitions} aria-hidden="true" focusable="false">
      <defs>{mapUrl && <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={mapUrl} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
        <feColorMatrix in="SourceGraphic" type="matrix" values={isolate(0)} result="cr" />
        <feDisplacementMap in="cr" in2="map" scale={distortion * (1 + .5 * aberration)} xChannelSelector="R" yChannelSelector="G" result="dr" />
        <feColorMatrix in="SourceGraphic" type="matrix" values={isolate(1)} result="cg" />
        <feDisplacementMap in="cg" in2="map" scale={distortion} xChannelSelector="R" yChannelSelector="G" result="dg" />
        <feColorMatrix in="SourceGraphic" type="matrix" values={isolate(2)} result="cb" />
        <feDisplacementMap in="cb" in2="map" scale={distortion * (1 - .5 * aberration)} xChannelSelector="R" yChannelSelector="G" result="db" />
        <feComposite in="dr" in2="dg" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="drg" />
        <feComposite in="drg" in2="db" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
      </filter>}</defs>
    </svg>
    <motion.div aria-hidden="true" className={styles.shadow} style={{ x: shadowX, y: shadowY, scale: lensScale, opacity: lensScale, width, height }} />
    <motion.div aria-hidden="true" inert data-glass-lens className={styles.lens} style={{ x: lensX, y: lensY, scale: lensScale, opacity: lensScale, width, height }}>
      <div className={styles.refraction} style={{ filter: mapUrl ? `url(#${filterId})` : undefined }}>
        <motion.div data-glass-copy className={styles.magnified} style={{ ...copyStyle, x: copyX, y: copyY, scale: magnification, width: dims.width, height: dims.height, transformOrigin: '0 0' }}>
          {lensContent ?? children}
        </motion.div>
      </div>
      <div className={styles.highlight} />
      <div className={styles.rim} />
    </motion.div>
  </div>;
}
