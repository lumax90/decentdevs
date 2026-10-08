import type { HeroDestinationId, HeroLocationId } from './hero-destinations';
import { planNearbyStop, type MapPoint } from './location-routing';

export const TOUR_FPS = 30;
export const TOUR_FRAMES = 210;
export const TOUR_IDLE_MS = 20000;

export const tourScenes = ['tennis', 'react', 'mobile', 'nextjs', 'rust', 'web', 'data', 'workflow', 'webapp', 'nodejs', 'python', 'typescript', 'flutter', 'go', 'swift', 'kotlin', 'csharp', 'dotnet', 'redis', 'docker', 'unity', 'graphql', 'webgl'] as const;
export type TourScene = typeof tourScenes[number];

export interface TourStop {
  location: HeroLocationId;
  label: string;
  title: string;
  description: string;
  scene: TourScene;
  composition: string;
  color: string;
  project: HeroDestinationId;
  posterFrame: number;
}

export const worldTourStops: readonly TourStop[] = [
  { location: 'game', label: 'Oyun', title: 'Bir tur daha?', description: 'Küçük bir kort, iyi bir ralli. Oyun fikrinin ilk hareketleri.', scene: 'tennis', composition: 'TourTennis', color: '#f4bb99', project: 'game', posterFrame: 88 },
  { location: 'react', label: 'React', title: 'Küçük parçalar. Canlı arayüzler.', description: 'Bileşenler bir araya geliyor; bir etkileşim, bütün ekranı güncelliyor.', scene: 'react', composition: 'TourReact', color: '#a9dcec', project: 'webapp', posterFrame: 146 },
  { location: 'mobile', label: 'Mobil', title: 'Hayatın ritmine karışır.', description: 'Cebe sığan bir rota, yerinde bir bildirim, tamamlanan bir iş.', scene: 'mobile', composition: 'TourMobile', color: '#a7d5f5', project: 'mobile', posterFrame: 152 },
  { location: 'nextjs', label: 'Next.js', title: 'Fikirden ilk ekrana.', description: 'İstek yola çıkıyor; sayfa, hazır olan parçalarıyla görünmeye başlıyor.', scene: 'nextjs', composition: 'TourNext', color: '#d8d4ef', project: 'website', posterFrame: 156 },
  { location: 'rust', label: 'Rust', title: 'Arka plandaki ince iş.', description: 'İşler düzenli bir akıştan geçiyor; sağlam bir temel, sakin bir sistem.', scene: 'rust', composition: 'TourRust', color: '#e8bd97', project: 'internal', posterFrame: 145 },
  { location: 'website', label: 'Web', title: 'Her ekranda, yerli yerinde.', description: 'Aynı fikir; masaüstünde, tablette ve telefonda kendi yerini buluyor.', scene: 'web', composition: 'TourWeb', color: '#d5f5a1', project: 'website', posterFrame: 158 },
  { location: 'postgresql', label: 'PostgreSQL', title: 'Veri, yerini bulunca.', description: 'Bir sorgu, doğru kayıtlar ve okunabilir bir sonuç.', scene: 'data', composition: 'TourData', color: '#b9d7e5', project: 'internal', posterFrame: 173 },
  { location: 'internal', label: 'Kurumsal', title: 'İşler birbirine bağlanır.', description: 'Bir talep, birkaç doğru adım ve tek panelde tamamlanan bir süreç.', scene: 'workflow', composition: 'TourWorkflow', color: '#e8d890', project: 'internal', posterFrame: 180 },
  { location: 'webapp', label: 'Web uygulaması', title: 'Bir işlem. Her şey güncel.', description: 'Bir tarih ve saat seçilir; randevu, tek ekranda yerini bulur.', scene: 'webapp', composition: 'TourWebApp', color: '#c9b7f7', project: 'webapp', posterFrame: 166 },
  { location: 'nodejs', label: 'Node.js', title: 'Her ekran aynı anda.', description: 'Bir mesaj farklı ekranlara ulaşır; herkes aynı konuşmada kalır.', scene: 'nodejs', composition: 'TourNode', color: '#b7d99a', project: 'webapp', posterFrame: 153 },
  { location: 'python', label: 'Python', title: 'Karmaşadan anlamlı bir sonuca.', description: 'Dağınık kayıtlar düzenlenir, tekrarlar ayıklanır ve bir grafiğe dönüşür.', scene: 'python', composition: 'TourPython', color: '#e6d391', project: 'internal', posterFrame: 170 },
  { location: 'typescript', label: 'TypeScript', title: 'Doğru parçalar, doğru yerler.', description: 'Metinler, sayılar ve durumlar uygun bağlantılarda birleşir.', scene: 'typescript', composition: 'TourTypeScript', color: '#a9cdec', project: 'webapp', posterFrame: 163 },
  { location: 'flutter', label: 'Flutter', title: 'Tek fikir, iki dünya.', description: 'Bir arayüz değişikliği iOS ve Android ekranlarına birlikte yansır.', scene: 'flutter', composition: 'TourFlutter', color: '#a6dfeb', project: 'mobile', posterFrame: 150 },
  { location: 'go', label: 'Go', title: 'Aynı anda, uyum içinde.', description: 'Farklı işler paralel yollardan geçer ve aynı sonuçta buluşur.', scene: 'go', composition: 'TourGo', color: '#a4d7d9', project: 'internal', posterFrame: 160 },
  { location: 'swift', label: 'Swift', title: 'Bir dokunuş kadar doğal.', description: 'Fotoğraflar bir kaydırmayla değişir; sevilen bir an kaydedilir.', scene: 'swift', composition: 'TourSwift', color: '#efbf9f', project: 'mobile', posterFrame: 163 },
  { location: 'kotlin', label: 'Kotlin', title: 'Günün ritmine uyar.', description: 'Bir liste güncellenir, yeni bir not eklenir ve kaydedilir.', scene: 'kotlin', composition: 'TourKotlin', color: '#c9b8ef', project: 'mobile', posterFrame: 169 },
  { location: 'csharp', label: 'C#', title: 'Her adımın hesabı yerinde.', description: 'Sipariş miktarı değiştikçe stok ve işlem özeti birlikte güncellenir.', scene: 'csharp', composition: 'TourCSharp', color: '#ccb9e6', project: 'internal', posterFrame: 168 },
  { location: 'dotnet', label: '.NET', title: 'Ayrı sistemler, ortak bir akış.', description: 'Satış, depo ve destek ekranları aynı kayıt etrafında buluşur.', scene: 'dotnet', composition: 'TourDotNet', color: '#bab9e8', project: 'internal', posterFrame: 164 },
  { location: 'redis', label: 'Redis', title: 'İhtiyacın, elinin altında.', description: 'Bir kez bulunan bilgi yakın bellekte saklanır ve tekrar kolayca gelir.', scene: 'redis', composition: 'TourRedis', color: '#e8b5ae', project: 'webapp', posterFrame: 161 },
  { location: 'docker', label: 'Docker', title: 'Her yerde aynı düzen.', description: 'Uygulamanın parçaları tek bir pakette toplanıp yayına taşınır.', scene: 'docker', composition: 'TourDocker', color: '#acd5e6', project: 'internal', posterFrame: 157 },
  { location: 'unity', label: 'Unity', title: 'Bir adım, yeni bir dünya.', description: 'Küçük bir karakter platformlar arasında zıplar ve üç ışığı toplar.', scene: 'unity', composition: 'TourUnity', color: '#d1c7e7', project: 'game', posterFrame: 128 },
  { location: 'graphql', label: 'GraphQL', title: 'Tam gereken kadar veri.', description: 'Seçilen alanlar tek bir istekte toplanır ve sade bir profile dönüşür.', scene: 'graphql', composition: 'TourGraphQL', color: '#e4b6d6', project: 'webapp', posterFrame: 168 },
  { location: 'webgl', label: 'WebGL', title: 'Işıkla, yüzeyle, hareketle.', description: 'Dönen üç boyutlu bir nesne farklı yüzeyler ve ışıklarla değişir.', scene: 'webgl', composition: 'TourWebGL', color: '#afd8ca', project: 'website', posterFrame: 153 },
];

export function tourStopFor(location: HeroLocationId | null) {
  return worldTourStops.find(stop => stop.location === location) ?? null;
}

export function tourMedia(scene: TourScene) {
  const version = scene === 'webapp' ? 4 : 3;
  return { src: `/hero/tour/${scene}.mp4?v=${version}`, poster: `/hero/tour/${scene}.webp?v=${version}`, duration: TOUR_FRAMES / TOUR_FPS };
}

export type TourPhase = 'waiting' | 'travelling' | 'settling' | 'preview' | 'departing';
export interface WorldTourState {
  mode: 'auto' | 'manual';
  phase: TourPhase;
  target: HeroLocationId | null;
  visited: HeroLocationId[];
  started: boolean;
  origin: MapPoint;
  visit: number;
  arrived: boolean;
}

export function createWorldTour(): WorldTourState {
  return { mode: 'auto', phase: 'waiting', target: null, visited: [], started: false, origin: [0, 1, 0], visit: 0, arrived: false };
}

export type TourAction =
  | { type: 'start'; origin?: MapPoint; visit?: number }
  | { type: 'manual'; target?: HeroLocationId | null; origin?: MapPoint }
  | { type: 'discover'; target: HeroLocationId; visit: number }
  | { type: 'arrive'; target: HeroLocationId; visit: number }
  | { type: 'reveal' | 'ended' | 'leave'; visit: number }
  | { type: 'skip'; origin?: MapPoint };

function travel(state: WorldTourState, from: HeroLocationId | MapPoint): WorldTourState {
  const next = planNearbyStop(from, state.visited);
  return { ...state, mode: 'auto', phase: 'travelling', target: next.location, visited: next.visited, started: true, visit: state.visit + 1, arrived: false };
}

export function advanceWorldTour(state: WorldTourState, action: TourAction): WorldTourState {
  if ('visit' in action && action.visit !== undefined && action.visit !== state.visit) return state;
  switch (action.type) {
    case 'start':
      if (!state.started && !action.origin) return { ...state, mode: 'auto', phase: 'travelling', target: 'game', started: true, visit: state.visit + 1, arrived: false };
      return travel(state, action.origin ?? state.target ?? state.origin);
    case 'skip': return travel(state, state.target ?? action.origin ?? state.origin);
    case 'manual': {
      const target = action.target ?? null;
      return { ...state, mode: 'manual', phase: target ? 'travelling' : 'waiting', target, origin: action.origin ?? state.origin, started: true, visit: state.visit + 1, arrived: false };
    }
    case 'discover':
      if (state.mode !== 'manual' || state.phase !== 'waiting') return state;
      return { ...state, target: action.target, phase: 'travelling', visit: state.visit + 1, arrived: false };
    case 'arrive':
      if (state.phase !== 'travelling' || state.target !== action.target) return state;
      return { ...state, visited: state.visited.includes(action.target) ? state.visited : [...state.visited, action.target], arrived: true, phase: 'settling' };
    case 'reveal':
      return state.phase === 'settling' ? { ...state, phase: 'preview' } : state;
    case 'ended':
      return state.phase === 'preview' ? { ...state, phase: 'departing' } : state;
    case 'leave':
      if (state.phase !== 'departing') return state;
      return travel(state, state.target ?? state.origin);
  }
}
