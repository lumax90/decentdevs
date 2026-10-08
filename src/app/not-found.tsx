import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandMark } from '@/components/brand';

export default function NotFound() {
  return <div className="brief-success container"><BrandMark /><span className="eyebrow">404 / KÜÇÜK BİR SAPMA</span><h1>Burada bir şey yok<span>.</span></h1><p>Oyun alanında daha ilginç şeyler var.</p><Link className="button button-lime" style={{ marginTop: 28 }} href="/"><ArrowLeft size={17} /> Stüdyoya dön</Link></div>;
}
