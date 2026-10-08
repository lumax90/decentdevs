import { useCurrentFrame } from 'remotion';
import { enter, mix, progress, Scene, smooth, Text } from './shared';

const rally = [
  { f: 13, u: .30, v: .90 }, { f: 37, u: .70, v: .13 },
  { f: 63, u: .27, v: .90 }, { f: 89, u: .24, v: .13 },
  { f: 116, u: .73, v: .90 }, { f: 143, u: .65, v: .13 },
  { f: 173, u: .88, v: 1.12 },
];

function court(u: number, v: number) {
  return { x: 320 + (u - .5) * mix(246, 420, v), y: 74 + v * 240 };
}

function ballAt(frame: number) {
  const segment = Math.max(0, rally.findIndex((point, i) => i < rally.length - 1 && frame < rally[i + 1].f));
  if (frame >= 173) return { ...court(.88, 1.12), z: 0, visible: false, bounced: 1 };
  const a = rally[segment], b = rally[segment + 1];
  const p = progress(frame, a.f, b.f);
  const startHeight = mix(17, 26, a.v), endHeight = mix(17, 26, Math.min(1, b.v));
  const z = p < .73 ? (1 - p / .73) * startHeight + Math.sin(p / .73 * Math.PI) * 39 : (p - .73) / .27 * endHeight + Math.sin((p - .73) / .27 * Math.PI) * 5;
  return { ...court(mix(a.u, b.u, p), mix(a.v, b.v, p)), z, visible: frame >= 13, bounced: p };
}

function playerU(frame: number, near: boolean) {
  const targets = near ? [{ f: 0, u: .30 }, rally[0], rally[2], rally[4], { f: 165, u: .68 }] : [{ f: 0, u: .53 }, rally[1], rally[3], rally[5]];
  let value = targets[0].u;
  for (let i = 1; i < targets.length; i++) {
    const a = targets[i - 1], b = targets[i];
    if (frame <= b.f) return mix(a.u, b.u, smooth(progress(frame, Math.max(a.f + 4, b.f - 20), b.f - 1)));
    value = b.u;
  }
  return value;
}

function Player({ frame, near }: { frame: number; near: boolean }) {
  const u = playerU(frame, near);
  const point = court(u - (near ? .085 : .10), near ? .91 : .135);
  const size = near ? 1 : .73;
  const speed = Math.abs(u - playerU(frame - 1, near));
  const gait = Math.sin(frame * .7) * Math.min(1, speed * 120) * 5;
  const hits = near ? [13, 63, 116] : [37, 89, 143];
  const hit = hits.reduce((best, time) => Math.max(best, Math.max(0, 1 - Math.abs(frame - time) / 7)), 0);
  const racket = (near ? -20 : 18) + hit * (near ? 25 : -15);
  return <g transform={`translate(${point.x} ${point.y}) scale(${size})`}>
    <ellipse cy={2} rx={13} ry={4} fill="#061b15" opacity={.25} />
    <path d={`M-5 -11L${-7 - gait} 0M5 -11L${7 + gait} 0`} stroke="#e9d7bd" strokeWidth={5} strokeLinecap="round" />
    <path d={`M${-7 - gait} 0h-5M${7 + gait} 0h5`} stroke="#f6f3e5" strokeWidth={4} strokeLinecap="round" />
    <rect x={-9} y={-30} width={18} height={22} rx={6} fill={near ? '#d5f5a1' : '#c9b7f7'} />
    <path d="M-8 -25l-8 12" stroke="#ead4bb" strokeWidth={5} strokeLinecap="round" />
    <g transform={`rotate(${racket} 7 -23)`}><path d="M7 -23l12 9 9-4" fill="none" stroke="#ead4bb" strokeWidth={5} strokeLinecap="round" /><path d="M28 -18l4-5" stroke="#faf8ed" strokeWidth={2} /><ellipse cx={36} cy={-28} rx={7} ry={10} transform="rotate(30 36 -28)" fill="#ddece21a" stroke="#f6e7ce" strokeWidth={2} /><path d="M31 -30l10 5m-7-11 2 15" stroke="#f6e7ce" strokeWidth={.6} /></g>
    <circle cy={-37} r={8} fill="#edd8c0" /><path d="M-8 -39q2-10 14-5l3 5" fill={near ? '#e9efcf' : '#625775'} />
  </g>;
}

export function TennisScene() {
  const f = useCurrentFrame(), ball = ballAt(f);
  const done = enter(f, 173);
  const corners = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => { const p = court(u, v); return `${p.x},${p.y}`; }).join(' ');
  const line = (a: [number, number], b: [number, number]) => { const p = court(...a), q = court(...b); return <path d={`M${p.x} ${p.y}L${q.x} ${q.y}`} />; };
  const netA = court(0, .5), netB = court(1, .5);
  return <Scene background="#163e32" color="#f1f2df">
    <defs><linearGradient id="court" x2="0" y2="1"><stop stopColor="#376650" /><stop offset="1" stopColor="#245844" /></linearGradient></defs>
    <circle cx={560} cy={28} r={132} fill="#d5f5a1" opacity={.025} />
    <Text x={28} y={35} size={17} fill="#bad0b6" mono>RALLY / 01</Text>
    <rect x={481} y={17} width={132} height={32} rx={16} fill="#0d2b22" /><circle cx={501} cy={33} r={4} fill="#d5f5a1" /><Text x={521} y={40} size={19}>{f > 174 ? '00  :  15' : '00  :  00'}</Text>
    <polygon points="168,78 472,78 553,337 87,337" fill="#092a20" opacity={.6} />
    <polygon points={corners} fill="url(#court)" stroke="#e5ecd0" strokeWidth={2} />
    <g fill="none" stroke="#d5e4c7" strokeWidth={1.5} opacity={.9}>{line([.12, 0], [.12, 1])}{line([.88, 0], [.88, 1])}{line([.12, .27], [.88, .27])}{line([.12, .73], [.88, .73])}{line([.5, .27], [.5, .73])}</g>
    <Player frame={f} near={false} />
    <path d={`M${netA.x} ${netA.y}v-15L${netB.x} ${netB.y - 15}v15Z`} fill="#eff7df14" stroke="#e5eed9" strokeWidth={1.5} />
    {Array.from({ length: 23 }, (_, i) => { const p = court(i / 22, .5); return <path key={i} d={`M${p.x} ${p.y}v-15`} stroke="#d9e8d5" strokeWidth={.55} opacity={.5} />; })}
    <Player frame={f} near />
    {ball.visible && <>
      <ellipse cx={ball.x} cy={ball.y + 1} rx={3 + ball.z * .075} ry={2} fill="#071e14" opacity={.26} />
      {[5, 4, 3, 2, 1].map(back => { const p = ballAt(f - back * .7); return <circle key={back} cx={p.x} cy={p.y - p.z} r={2.2} fill="#effe8f" opacity={.15 - back * .019} />; })}
      <circle cx={ball.x} cy={ball.y - ball.z} r={4.3} fill="#e9ff83" /><path d={`M${ball.x - 3} ${ball.y - ball.z - 2}q4 1 4 5`} fill="none" stroke="#fffbc8" strokeWidth={1} />
    </>}
    <g transform={`translate(320 ${174 + (1 - done) * 14}) scale(${.95 + done * .05})`} opacity={done}><rect x={-102} y={-31} width={204} height={61} rx={20} fill="#e7f1d1" /><Text x={0} y={8} size={27} fill="#294b31" anchor="middle">Güzel ralli.</Text></g>
    <Text x={29} y={341} size={13} fill="#9dbea5" mono>GOOD ENOUGH TO PLAY.</Text>
    <Text x={610} y={341} size={13} fill="#9dbea5" anchor="end">Bir tur daha ↗</Text>
  </Scene>;
}
