import type { ProjectType } from './brief';

// A golden-angle distribution puts a new set of places on every side of the
// globe. These coordinates describe the initial view, not screen positions.
const locationCount = 23;
function locationPosition(slot: number): readonly [number, number, number] {
  const y = 1 - 2 * (slot + 0.5) / locationCount;
  const radius = Math.sqrt(1 - y * y);
  const longitude = slot * Math.PI * (3 - Math.sqrt(5)) + 0.2;
  return [Math.sin(longitude) * radius, y, Math.cos(longitude) * radius];
}

export const heroDestinations = [
  { id: 'website', label: 'Web sitesi', mapLabel: 'Web', note: 'Markanın internetteki iyi hâli.', color: '#d5f5a1', position: locationPosition(5) },
  { id: 'webapp', label: 'Web uygulaması', mapLabel: 'Uygulama', note: 'Bir sekmede, epey şey mümkün.', color: '#c9b7f7', position: locationPosition(3) },
  { id: 'mobile', label: 'Mobil uygulama', mapLabel: 'Mobil', note: 'Cebe sığan, hayata karışan fikirler.', color: '#a7d5f5', position: locationPosition(13) },
  { id: 'game', label: 'Oyun', mapLabel: 'Oyun', note: 'Bir tur daha dedirten dünyalar.', color: '#f4bb99', position: locationPosition(7) },
  { id: 'internal', label: 'Kurumsal uygulama', mapLabel: 'Kurumsal', note: 'İşine uyan, yükünü hafifleten yazılım.', color: '#e8d890', position: locationPosition(12) },
] as const satisfies readonly { id: ProjectType; label: string; mapLabel: string; note: string; color: string; position: readonly [number, number, number] }[];

export type HeroDestinationId = typeof heroDestinations[number]['id'];

export interface HeroMapLocation {
  id: HeroLocationId;
  label: string;
  kind: 'destination' | 'technology';
  color: string;
  position: readonly [number, number, number];
}

const technologies = [
  { id: 'nodejs', label: 'Node.js', slot: 0 },
  { id: 'python', label: 'Python', slot: 1 },
  { id: 'react', label: 'React', slot: 2 },
  { id: 'typescript', label: 'TypeScript', slot: 4 },
  { id: 'postgresql', label: 'PostgreSQL', slot: 6 },
  { id: 'nextjs', label: 'Next.js', slot: 8 },
  { id: 'flutter', label: 'Flutter', slot: 9 },
  { id: 'rust', label: 'Rust', slot: 10 },
  { id: 'go', label: 'Go', slot: 11 },
  { id: 'swift', label: 'Swift', slot: 14 },
  { id: 'kotlin', label: 'Kotlin', slot: 15 },
  { id: 'csharp', label: 'C#', slot: 16 },
  { id: 'dotnet', label: '.NET', slot: 17 },
  { id: 'redis', label: 'Redis', slot: 18 },
  { id: 'docker', label: 'Docker', slot: 19 },
  { id: 'unity', label: 'Unity', slot: 20 },
  { id: 'graphql', label: 'GraphQL', slot: 21 },
  { id: 'webgl', label: 'WebGL', slot: 22 },
] as const;

export type HeroLocationId = HeroDestinationId | typeof technologies[number]['id'];

export const heroMapLocations: readonly HeroMapLocation[] = [
  ...heroDestinations.map(destination => ({
    id: destination.id, label: destination.mapLabel, kind: 'destination' as const,
    color: destination.color, position: destination.position,
  })),
  ...technologies.map(technology => ({
    id: technology.id, label: technology.label, kind: 'technology' as const,
    color: '#d0d9d5', position: locationPosition(technology.slot),
  })),
];
