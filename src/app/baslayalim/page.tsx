import type { Metadata } from 'next';
import { BriefWizard } from '@/components/brief-wizard';

export const metadata: Metadata = { title: 'Fikrini anlat', description: 'Fikrini birkaç iyi soruyla bir proje özetine dönüştürelim. Web, mobil, oyun ve özel yazılım projeleri için başlangıç noktası.', alternates: { canonical: '/baslayalim' }, robots: { index: false, follow: true } };

export default function StartPage() { return <BriefWizard />; }
