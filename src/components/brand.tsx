import Link from 'next/link';

export function BrandMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="42" height="42" rx="14" fill="currentColor" />
    <path d="M14 17v4m16-4v4" stroke="var(--mark-ink, #172012)" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M15 28c4 3.5 10 3.5 14-1" stroke="var(--mark-ink, #172012)" strokeWidth="2.8" strokeLinecap="round" />
  </svg>;
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" prefetch={false} className={`brand ${footer ? 'brand-footer' : ''}`} aria-label="decentdevs. — ana sayfa">
    <BrandMark /><span>decent<span className="brand-second">devs</span><span className="brand-dot">.</span></span>
  </Link>;
}
