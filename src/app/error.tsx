'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div className="brief-success container"><span className="eyebrow">BİR KÜÇÜK AKSAKLIK</span><h1>Bir daha bakalım<span>.</span></h1><p>Bu sayfa şu anda yüklenemedi.</p><div className="success-actions"><button type="button" className="button button-lime" onClick={retry}>Tekrar dene <RotateCcw size={17} /></button><Link href="/" className="button button-ghost">Stüdyoya dön</Link></div></div>;
}
