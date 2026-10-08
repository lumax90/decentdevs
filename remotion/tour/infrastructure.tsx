import { useCurrentFrame } from 'remotion';
import { Check, enter, mix, Packet, progress, Scene, smooth, Text } from './shared';

export function GoScene() {
  const f = useCurrentFrame();
  const lanes = [{ y: 112, end: 119, color: '#91bcb8' }, { y: 190, end: 148, color: '#b6c98a' }, { y: 268, end: 133, color: '#9eb7d1' }];
  const completed = lanes.filter(lane => f >= lane.end).length;
  return <Scene background="#dfedef" color="#456770">
    <Text x={30} y={37} size={23}>Aynı anda, uyum içinde.</Text><Text x={610} y={37} size={17} anchor="end" fill="#89b0b9">Go</Text>
    <path d="M130 190h55M185 112v156M185 112h313M185 190h313M185 268h313M500 112v156M500 190h51" fill="none" stroke="#aecbd0" strokeWidth={2} />
    <circle cx={80} cy={190} r={48} fill="#f5fbfa" /><Text x={80} y={198} anchor="middle" size={29}>Go</Text><Text x={80} y={257} anchor="middle" size={12} fill="#8cabb4">iş kuyruğu</Text>
    {lanes.map((lane, i) => {
      const p = smooth(progress(f, 27, lane.end));
      return <g key={i}><rect x={213} y={lane.y - 24} width={254} height={48} rx={17} fill="#f1f8f6" /><Text x={236} y={lane.y + 5} size={13} fill="#9cb5b8">{['birinci iş', 'ikinci iş', 'üçüncü iş'][i]}</Text><g transform={`translate(${mix(194, 487, p)} ${lane.y})`} opacity={f >= 27 && p < 1 ? 1 : 0}><rect x={-15} y={-15} width={30} height={30} rx={8} fill={lane.color} /><Text x={0} y={5} size={12} anchor="middle" fill="#fff">0{i + 1}</Text></g>{p === 1 && <Check x={441} y={lane.y} size={17} />}</g>;
    })}
    <circle cx={562} cy={190} r={37} fill={completed === 3 ? '#cee1b2' : '#eaf4ef'} />{completed === 3 ? <Check x={562} y={190} size={30} /> : <Text x={562} y={198} size={25} anchor="middle">{completed}/3</Text>}
    <Text x={320} y={337} size={15} anchor="middle" fill="#8ca9ae">Farklı yollar. Birlikte tamamlanan işler.</Text>
  </Scene>;
}

export function CSharpScene() {
  const f = useCurrentFrame(), quantity = f < 62 ? 1 : f < 94 ? 2 : 3, ordered = f > 143;
  return <Scene background="#e9e2f0" color="#62506e">
    <Text x={30} y={38} size={23}>Her adımın hesabı yerinde.</Text><Text x={610} y={38} size={18} anchor="end" fill="#ae96bd">C#</Text>
    <g transform="translate(37 84)"><rect x={5} y={7} width={239} height={225} rx={22} fill="#a58eb8" opacity={.15} /><rect width={239} height={225} rx={22} fill="#fffbff" /><Text x={21} y={34} size={19}>Yeni sipariş</Text><rect x={20} y={54} width={199} height={46} rx={12} fill="#f1e9f7" /><Text x={34} y={82} size={16}>Masa lambası</Text><Text x={21} y={132} size={12} fill="#a490b2">Adet</Text><rect x={98} y={111} width={121} height={35} rx={12} fill="#ece0f5" /><Text x={115} y={135} size={21}>−</Text><Text x={159} y={135} size={19} anchor="middle">{quantity}</Text><Text x={204} y={135} size={21} anchor="middle">+</Text><rect x={20} y={166} width={199} height={38} rx={13} fill={ordered ? '#d1e4b8' : '#c7ade0'} /><Text x={119} y={191} size={14} anchor="middle" fill={ordered ? '#6b854f' : '#fff'}>{ordered ? 'Sipariş oluşturuldu ✓' : 'Siparişi oluştur'}</Text></g>
    <path d="M282 197h79" stroke="#bfa9cf" strokeWidth={2} strokeDasharray="4 7" /><Packet from={[282, 197]} to={[365, 197]} start={144} duration={17} color="#ac8aca" size={6} />
    <g transform="translate(369 94)"><rect width={231} height={206} rx={21} fill="#f7f2fb" /><Text x={21} y={34} size={18}>Stok görünümü</Text><Text x={21} y={68} size={12} fill="#aa96ba">Masa lambası</Text><Text x={21} y={122} size={44}>{ordered ? 24 - quantity : 24}</Text><Text x={91} y={122} size={14} fill="#ad9cba">adet</Text><path d="M20 141h190" stroke="#e0d1e9" /><Text x={21} y={173} size={13} fill="#91a376">{ordered ? 'Kayıtlar birlikte güncellendi.' : 'Sipariş bekleniyor.'}</Text>{ordered && <Check x={195} y={109} size={26} />}</g>
    {[62, 94].map(time => <circle key={time} cx={242} cy={213} r={8 + progress(f, time, time + 15) * 16} fill="none" stroke="#ae90c5" opacity={f >= time ? 1 - progress(f, time, time + 15) : 0} />)}
  </Scene>;
}

export function DotNetScene() {
  const f = useCurrentFrame();
  const cards = [{ x: 35, y: 92, label: 'Satış', text: 'Yeni kayıt', done: 35 }, { x: 420, y: 73, label: 'Depo', text: 'Hazırlanıyor', done: 103 }, { x: 420, y: 232, label: 'Destek', text: 'Bilgi güncel', done: 128 }];
  return <Scene background="#e3e3f2" color="#565477">
    <Text x={30} y={36} size={23}>Ayrı sistemler, ortak bir akış.</Text><Text x={610} y={36} size={17} anchor="end" fill="#9794bb">.NET</Text>
    <path d="M211 162l66 24m82-12 59-44m-59 70 59 80" fill="none" stroke="#b6b3d1" strokeWidth={2} strokeDasharray="4 7" />
    {cards.map((card, i) => <g key={card.label} transform={`translate(${card.x} ${card.y})`}><rect x={4} y={6} width={183} height={111} rx={19} fill="#8c89ad" opacity={.13} /><rect width={183} height={111} rx={19} fill="#fcfaff" /><Text x={17} y={29} size={17}>{card.label}</Text><path d="M17 42h149" stroke="#e5e1f0" /><rect x={17} y={57} width={148} height={34} rx={10} fill={f > card.done ? ['#e8d6c4', '#d5e3bc', '#d3e2ed'][i] : '#eeeaf5'} /><Text x={30} y={79} size={13} fill={f > card.done ? '#7b8270' : '#bbb1c8'}>{f > card.done ? card.text : 'Bağlı'}</Text>{f > card.done && <Check x={146} y={73} size={12} />}</g>)}
    <g transform={`translate(319 188) scale(${enter(f, 10)})`}><circle r={45} fill="#9e94c5" /><circle r={35} fill="none" stroke="#c1b9df" /><Text x={0} y={7} anchor="middle" size={25} fill="#fff">.NET</Text></g>
    <Packet from={[218, 162]} to={[274, 186]} start={39} duration={24} color="#c5a782" /><Packet from={[360, 174]} to={[420, 128]} start={78} duration={24} color="#acbf83" /><Packet from={[360, 200]} to={[420, 279]} start={98} duration={29} color="#95b8d1" />
    <Text x={39} y={293} size={18} fill="#9690af">Tek tek araçlar.</Text><Text x={39} y={322} size={18} fill="#787294" opacity={enter(f, 146)}>Birlikte çalışan sistemler.</Text>
  </Scene>;
}

function Cargo({ x, y, scale = 1, closed = false }: { x: number; y: number; scale?: number; closed?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M-47-18 0-42 47-18V38L0 63-47 38Z" fill="#8bb5c9" /><path d="M-47-18 0 7v56l-47-25Z" fill="#739cb5" /><path d="M47-18 0 7v56l47-25Z" fill="#96bfd0" />{[-31, -17, -3].map((v, i) => <path key={i} d={`M${v} ${-10 + i * 7}v40m${-v + 4} ${-10 + i * 7}v40`} stroke="#527f9a" opacity={.4} />)}{closed && <path d="M-47-18 0-42 47-18 0 7Z" fill="#bed9e4" />}<Text x={0} y={32} size={13} fill="#edf7fa" anchor="middle">APP</Text></g>;
}

export function DockerScene() {
  const f = useCurrentFrame(), packed = f >= 83, travel = smooth(progress(f, 99, 164));
  return <Scene background="#deebf1" color="#496c80">
    <Text x={30} y={37} size={23}>Her yerde aynı düzen.</Text><Text x={610} y={37} size={16} anchor="end" fill="#85acbf">Docker</Text>
    <path d="M154 251h353" stroke="#a8c7d5" strokeWidth={2} strokeDasharray="5 8" /><rect x={42} y={238} width={185} height={24} rx={12} fill="#bed6e1" /><rect x={416} y={238} width={184} height={24} rx={12} fill="#bed6e1" />
    <Text x={134} y={295} size={15} anchor="middle" fill="#8ba8b6">Geliştirme</Text><Text x={508} y={295} size={15} anchor="middle" fill="#8ba8b6">Yayın</Text>
    <Cargo x={mix(135, 506, travel)} y={173 - Math.sin(travel * Math.PI) * 37} closed={packed} />
    {['arayüz', 'veri', 'api'].map((name, i) => {
      const p = smooth(progress(f, 7 + i * 20, 41 + i * 20));
      return <g key={name} opacity={p < .96 ? 1 : 0} transform={`translate(${mix(260 + i * 112, 135, p)} ${mix(97, 153, p)}) scale(${1 - p * .4})`}><rect x={-33} y={-18} width={66} height={36} rx={10} fill={['#d4c4e9', '#d1e3b7', '#ecd0b7'][i]} /><Text x={0} y={5} size={12} fill="#7e8190" anchor="middle">{name}</Text></g>;
    })}
    <g opacity={enter(f, 171)}><rect x={233} y={310} width={226} height={32} rx={16} fill="#f2f8f5" /><Check x={256} y={326} size={14} /><Text x={279} y={332} size={14}>Olduğu gibi taşınır.</Text></g>
    <path d="M480 97c-2-21 26-32 39-15 18-9 34 10 25 23h-63q-17-1-1-8" fill="#f3f8fa" />
  </Scene>;
}
