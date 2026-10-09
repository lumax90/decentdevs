import Link from 'next/link';

export function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true" data-brand-mark="04">
    <path d="M18 5h13c18 0 28 10.5 28 27S49 59 31 59H18C10 59 5 54 5 46V18C5 10 10 5 18 5Z" fill="currentColor" />
    <path d="m18.5 21.5 6 4.5-6 4.5" stroke="var(--mark-ink, #172012)" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M39.5 22.5v7" stroke="var(--mark-ink, #172012)" strokeWidth="3.8" strokeLinecap="round" />
    <path d="M20.5 40.5C25.5 42.5 35 42.5 40 40.5" stroke="var(--mark-ink, #172012)" strokeWidth="3.3" strokeLinecap="round" />
  </svg>;
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" prefetch={false} className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="decentdevs. — ana sayfa">
    <BrandMark /><span>decent<span className="brand-second">devs</span><span className="brand-dot">.</span></span>
  </Link>;
}
