import { useCurrentFrame } from 'remotion';
import { Check, Cursor, Dots, enter, mix, progress, Scene, smooth, Text } from './shared';

export function MobileScene() {
  const f = useCurrentFrame();
  const route = progress(f, 38, 137);
  const path = [{ x: 287, y: 160 }, { x: 349, y: 160 }, { x: 349, y: 207 }, { x: 308, y: 229 }];
  const part = Math.min(2, Math.floor(route * 3));
  const local = Math.min(1, route * 3 - part);
  const dot = { x: mix(path[part].x, path[part + 1].x, local), y: mix(path[part].y, path[part + 1].y, local) };
  const complete = enter(f, 139);
  return <Scene background="#e5edf0" color="#344b56">
    <circle cx={320} cy={170} r={161} fill="#d0e0e5" />
    <circle cx={320} cy={170} r={131} fill="none" stroke="#bacfd5" strokeWidth={1} strokeDasharray="4 8" />
    <g transform={`translate(${mix(-80, 34, enter(f, 14))} 102) rotate(-6 85 44)`} opacity={enter(f, 14)}>
      <rect x={4} y={7} width={159} height={83} rx={18} fill="#99afb9" opacity={.15} /><rect width={159} height={83} rx={18} fill="#fffefa" />
      <Text x={18} y={28} size={13} fill="#8b9fa8">BUGÜN</Text><Text x={18} y={59} size={20}>3 küçük durak.</Text>
    </g>
    <g transform={`translate(0 ${(1 - enter(f, 2)) * 45})`} opacity={enter(f, 2)}>
      <rect x={229} y={24} width={185} height={314} rx={31} fill="#45525b" opacity={.18} transform="translate(7 5)" />
      <rect x={225} y={18} width={185} height={314} rx={31} fill="#26353e" /><rect x={232} y={25} width={171} height={300} rx={25} fill="#fbfcf8" />
      <rect x={294} y={30} width={48} height={10} rx={6} fill="#26353e" />
      <Text x={246} y={52} size={10}>9:41</Text><path d="M368 47h5m3-2h5m3-2h5" stroke="#41555f" strokeWidth={2} />
      <Text x={248} y={91} size={24}>Yola çıkalım.</Text><Text x={248} y={112} size={12} fill="#8b9ca1">Her şey yerli yerinde.</Text>
      <rect x={245} y={130} width={145} height={121} rx={17} fill="#e6eddf" />
      <path d="M253 179h130M265 133v111M324 136v109M373 136v106M250 221h133" stroke="#fcfff6" strokeWidth={9} />
      <path d="M287 160h62v47l-41 22" fill="none" stroke="#9eb77d" strokeWidth={3} strokeLinecap="round" strokeDasharray="4 6" />
      {path.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r={i === 3 ? 7 : 4} fill={i / 3 <= route ? '#68854e' : '#c2d3b2'} />)}
      <circle cx={dot.x} cy={dot.y} r={10} fill="#edf6da" /><circle cx={dot.x} cy={dot.y} r={5} fill="#56733f" />
      <rect x={245} y={268} width={145} height={37} rx={13} fill={f > 139 ? '#c5dea9' : '#b9d9e5'} /><Text x={318} y={292} anchor="middle" size={16}>{f > 139 ? 'Tamamlandı ✓' : f > 39 ? 'Yoldayız…' : 'Rotayı başlat'}</Text>
      <rect x={291} y={315} width={53} height={3} rx={2} fill="#9aa5a7" />
    </g>
    <g transform={`translate(${mix(640, 423, complete)} 129) rotate(5 83 38)`} opacity={complete}>
      <rect x={3} y={6} width={180} height={90} rx={18} fill="#91adb3" opacity={.15} /><rect width={180} height={90} rx={18} fill="#f5faed" />
      <circle cx={27} cy={28} r={12} fill="#c7dea9" /><Check x={27} y={28} size={14} /><Text x={47} y={34} size={15}>Tam zamanında.</Text><Text x={18} y={61} size={12} fill="#80916e">Küçük bir bildirim.</Text><Text x={18} y={78} size={12} fill="#80916e">Büyük rahatlık.</Text>
    </g>
    {f < 63 && <Cursor x={mix(458, 332, smooth(progress(f, 16, 36)))} y={mix(334, 285, smooth(progress(f, 16, 36)))} click={Math.max(0, 1 - Math.abs(f - 38) / 13)} />}
    <Text x={320} y={353} anchor="middle" size={12} fill="#8199a3" mono>GÜNLÜK HAYATA KARIŞIR.</Text>
  </Scene>;
}

function Plant({ x, y, scale }: { x: number; y: number; scale: number }) {
  const f = useCurrentFrame();
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={85} rx={67} ry={14} fill="#617355" opacity={.12} />
    <path d="M-42 12h84L32 82q-30 18-64 0Z" fill="#d9b698" /><ellipse cy={12} rx={42} ry={12} fill="#eacbb0" /><ellipse cy={12} rx={32} ry={7} fill="#786555" />
    <g transform={`rotate(${Math.sin(f / 38) * 2} 0 13)`}>
      <path d="M0 13v-92M0-31l-34-24M0-48l31-28" stroke="#557d4a" strokeWidth={4} fill="none" />
      <ellipse cx={-26} cy={-65} rx={15} ry={32} transform="rotate(-49 -26 -65)" fill="#749460" /><ellipse cx={27} cy={-84} rx={15} ry={34} transform="rotate(44 27 -84)" fill="#90a773" /><ellipse cy={-83} rx={16} ry={34} fill="#567b4b" /><ellipse cx={-26} cy={-19} rx={15} ry={29} transform="rotate(-60 -26 -19)" fill="#9fb781" />
    </g>
  </g>;
}

export function WebScene() {
  const f = useCurrentFrame();
  const width = f < 74 ? mix(512, 335, smooth(progress(f, 47, 74))) : mix(335, 177, smooth(progress(f, 117, 145)));
  const left = 320 - width / 2, compact = width < 258;
  const height = 251;
  return <Scene background="#eeeadd" color="#41513a">
    <Text x={320} y={36} anchor="middle" size={23}>Her ekranda, kendi ritminde.</Text>
    <g transform={`translate(${left} ${57 + (1 - enter(f)) * 15})`} opacity={enter(f)}>
      <rect x={5} y={7} width={width} height={height} rx={15} fill="#9fa48e" opacity={.17} />
      <rect width={width} height={height} rx={15} fill="#fffdf6" stroke="#d1d3c1" />
      <path d={`M0 29H${width}`} stroke="#e5e4d5" /><Dots x={16} y={15} color="#a7af96" /><rect x={width / 2 - 37} y={10} width={74} height={10} rx={5} fill="#ebedde" />
      <Text x={21} y={59} size={19} weight={700}>mori.</Text>{!compact && <Text x={width - 22} y={57} size={10} anchor="end" fill="#839074">koleksiyon   hikâyemiz   ↗</Text>}
      {compact ? <>
        <Text x={20} y={91} size={21}>Biraz doğa.</Text><Text x={20} y={111} size={10} fill="#839074">Kendine küçük bir yer aç.</Text>
        <ellipse cx={width / 2} cy={173} rx={58} ry={55} fill="#e5ecd3" /><Plant x={width / 2} y={175} scale={.43} />
        <rect x={20} y={222} width={width - 40} height={17} rx={8.5} fill="#587447" /><Text x={width / 2} y={234} size={9} fill="#fffdf5" anchor="middle">Biraz keşfet ↗</Text>
      </> : <>
        <Text x={24} y={126} size={width < 390 ? 28 : 36}>Biraz doğa.</Text><Text x={24} y={154} size={width < 390 ? 13 : 16} fill="#839074">Kendine küçük bir yer aç.</Text>
        <rect x={24} y={179} width={114} height={31} rx={15.5} fill="#587447" /><Text x={81} y={200} size={12} fill="#fffdf5" anchor="middle">Biraz keşfet ↗</Text>
        <ellipse cx={width * .79} cy={150} rx={width * .16} ry={76} fill="#e5ecd3" /><Plant x={width * .79} y={153} scale={width < 390 ? .55 : .77} />
        <Text x={24} y={236} size={9} fill="#9ca28e">AZ EŞYA. BİRAZ NEFES.</Text>
      </>}
    </g>
    {[['Masaüstü', 1440], ['Tablet', 768], ['Mobil', 390]].map(([label, pixels], i) => {
      const active = i === (f < 70 ? 0 : f < 142 ? 1 : 2);
      return <g key={label} transform={`translate(${218 + i * 105} 335)`}><circle cx={-10} cy={-4} r={3.5} fill={active ? '#718952' : '#c3c7b5'} /><Text x={0} y={0} size={12} fill={active ? '#50633e' : '#a4aa97'}>{label}</Text><Text x={0} y={14} size={8} fill="#a0a790" mono>{pixels}px</Text></g>;
    })}
  </Scene>;
}
