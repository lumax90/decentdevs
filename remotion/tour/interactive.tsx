import { useCurrentFrame } from 'remotion';
import { Check, enter, mix, progress, Scene, smooth, Text } from './shared';

export function TypeScriptScene() {
  const f = useCurrentFrame();
  const rows = [{ y: 112, label: 'Metin', value: 'Merhaba', color: '#abcbe0', done: 60 }, { y: 191, label: 'Sayı', value: f < 84 ? '"24"' : '24', color: '#c4d7b1', done: 130 }, { y: 270, label: 'Durum', value: '✓', color: '#d7c3e8', done: 95 }];
  return <Scene background="#e2ebf3" color="#47677e">
    <Text x={30} y={37} size={23}>Doğru parçalar, doğru yerler.</Text><Text x={609} y={37} size={16} anchor="end" fill="#8caabf">TypeScript</Text>
    <rect x={272} y={71} width={97} height={244} rx={24} fill="#d0e0ed" /><Text x={320} y={199} size={39} anchor="middle" fill="#7da5c5">TS</Text>
    {rows.map((row, i) => {
      const p = i === 1 ? f < 65 ? progress(f, 23, 62) : f < 85 ? 1 - progress(f, 66, 84) : progress(f, 85, 130) : progress(f, i === 0 ? 15 : 44, row.done);
      const done = f >= row.done;
      const x = mix(94, 491, smooth(p));
      return <g key={row.label}>
        <path d={`M141 ${row.y}h295`} stroke="#aec4d4" strokeWidth={1.5} strokeDasharray="4 7" />
        <rect x={35} y={row.y - 26} width={126} height={52} rx={15} fill="#f5f9fc" /><Text x={98} y={row.y + 43} size={11} fill="#90a9b8" anchor="middle">{i === 1 && f > 65 && f < 85 ? 'bir küçük düzeltme' : row.label}</Text>
        <rect x={446} y={row.y - 26} width={156} height={52} rx={15} fill={done ? '#f7fbf5' : '#eff5f9'} stroke={i === 1 && f >= 62 && f < 84 ? '#d4a19d' : done ? '#b8cd9f' : '#c6d7e2'} />
        {done ? <><Text x={480} y={row.y + 6} size={16}>{row.label}</Text><Check x={577} y={row.y} size={18} /></> : <Text x={576} y={row.y + 5} size={13} fill="#9eb4c1" anchor="end">{row.label}</Text>}
        {!done && <g transform={`translate(${x + (i === 1 && f > 62 && f < 75 ? Math.sin(f * 1.6) * 4 : 0)} ${row.y})`}><rect x={-42} y={-18} width={84} height={36} rx={10} fill={row.color} /><Text x={0} y={5} size={14} anchor="middle" fill="#48617a" mono>{row.value}</Text></g>}
      </g>;
    })}
    <Text x={320} y={345} anchor="middle" size={13} fill="#88a2b5" opacity={enter(f, 143)}>Birbirini anlayan parçalar.</Text>
  </Scene>;
}

const jumps = [{ f: 0, x: 63, y: 281 }, { f: 56, x: 214, y: 234 }, { f: 111, x: 364, y: 197 }, { f: 164, x: 531, y: 239 }];
function jumpAt(frame: number) {
  const i = frame >= 164 ? 2 : Math.max(0, jumps.findIndex((point, i) => i < 3 && frame <= jumps[i + 1].f));
  const a = jumps[i], b = jumps[i + 1], p = progress(frame, a.f, b.f);
  return { x: mix(a.x, b.x, p), ground: mix(a.y, b.y, p), y: mix(a.y, b.y, p) - Math.sin(p * Math.PI) * 68, p };
}

export function UnityScene() {
  const f = useCurrentFrame(), player = jumpAt(f);
  const gems = [{ x: 151, y: 158, at: 33 }, { x: 301, y: 118, at: 88 }, { x: 461, y: 125, at: 142 }];
  return <Scene background="#ddd9ed" color="#5b5378">
    <Text x={30} y={36} size={23}>Bir adım, yeni bir dünya.</Text><rect x={520} y={16} width={91} height={31} rx={15} fill="#f3eef9" /><Text x={565} y={38} size={17} anchor="middle">{gems.filter(gem => f >= gem.at).length} / 3</Text>
    <ellipse cx={337} cy={302} rx={283} ry={28} fill="#c7c0df" />
    {[{ x: 65, y: 281, w: 109 }, { x: 214, y: 234, w: 114 }, { x: 364, y: 197, w: 122 }, { x: 531, y: 239, w: 124 }].map((p, i) => <g key={i}>
      <path d={`M${p.x - p.w / 2} ${p.y}v38l${p.w / 2} 18V${p.y + 16}Z`} fill="#9b9ac2" /><path d={`M${p.x + p.w / 2} ${p.y}v38l${-p.w / 2} 18V${p.y + 16}Z`} fill="#b0aed1" /><path d={`M${p.x - p.w / 2} ${p.y}l${p.w / 2}-18 ${p.w / 2} 18-${p.w / 2} 18Z`} fill="#c5dba9" /><path d={`M${p.x - p.w / 2 + 5} ${p.y}l${p.w / 2 - 5}-15 ${p.w / 2 - 5} 15`} stroke="#e2efc9" fill="none" />
    </g>)}
    {gems.map((gem, i) => <g key={i}>
      {f < gem.at && <g transform={`translate(${gem.x} ${gem.y + Math.sin(f / 15 + i) * 3}) rotate(${Math.sin(f / 20) * 8})`}><circle r={18} fill="#f6edd1" opacity={.3} /><path d="M0-12 8 0 0 12-8 0Z" fill="#f4e4a4" stroke="#fff4c7" strokeWidth={1.5} /></g>}
      {f >= gem.at && <g opacity={1 - progress(f, gem.at, gem.at + 19)}>{[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} d={`M0 ${-9 - progress(f, gem.at, gem.at + 19) * 20}v-6`} transform={`translate(${gem.x} ${gem.y}) rotate(${angle})`} stroke="#fff2c3" strokeWidth={2} strokeLinecap="round" />)}</g>}
    </g>)}
    <ellipse cx={player.x} cy={player.ground + 2} rx={12 - Math.sin(player.p * Math.PI) * 4} ry={4} fill="#5b5a78" opacity={.25} />
    <g transform={`translate(${player.x} ${player.y}) rotate(${Math.sin(player.p * Math.PI) * 9})`}><path d="M-5-5l-6 5m15-5 7 5" stroke="#f0e7da" strokeWidth={5} strokeLinecap="round" /><rect x={-10} y={-28} width={20} height={25} rx={7} fill="#607aa1" /><path d={`M-9-22l-7 ${Math.sin(player.p * Math.PI) * -7 + 8}m25-8 10-5`} stroke="#f3d8bf" strokeWidth={4} strokeLinecap="round" /><circle cy={-36} r={9} fill="#f3d8bf" /><path d="M-9-38q2-13 18-5v7" fill="#536486" /><circle cx={5} cy={-36} r={1.2} fill="#596174" /></g>
    <Text x={30} y={342} size={13} fill="#9990b1">Unity</Text><Text x={609} y={342} size={13} fill="#9990b1" anchor="end">{f > 170 ? 'Merak ettikçe yol açılır.' : 'Bir sonraki adım seni bekliyor.'}</Text>
  </Scene>;
}

type V3 = [number, number, number];
const t = (1 + Math.sqrt(5)) / 2;
const vertices: V3[] = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
const faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];

function rotate([x, y, z]: V3, frame: number): V3 {
  const n = Math.hypot(x, y, z); x /= n; y /= n; z /= n;
  const a = frame * .015 + .3, b = frame * .008 + .2;
  const X = x * Math.cos(a) + z * Math.sin(a), Z = -x * Math.sin(a) + z * Math.cos(a);
  return [X, y * Math.cos(b) - Z * Math.sin(b), y * Math.sin(b) + Z * Math.cos(b)];
}

export function WebGLScene() {
  const f = useCurrentFrame();
  const rotated = vertices.map(vertex => rotate(vertex, f));
  const material = f < 72 ? 0 : f < 139 ? 1 : 2;
  const base = material === 1 ? [196, 174, 212] : [120, 174, 165];
  const triangles = faces.map((face, index) => {
    const [a, b, c] = face.map(i => rotated[i]);
    const u = b.map((v, i) => v - a[i]), v = c.map((value, i) => value - a[i]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const length = Math.hypot(...n);
    const light = .48 + .52 * Math.max(0, (n[0] * -.4 + n[1] * -.5 + n[2] * .75) / length);
    const points = face.map(i => { const [x, y, z] = rotated[i]; const scale = 116 * 4 / (4 - z); return `${320 + x * scale},${174 + y * scale}`; }).join(' ');
    return { index, points, depth: (a[2] + b[2] + c[2]) / 3, color: `rgb(${base.map(channel => Math.round(channel * light)).join(',')})` };
  }).sort((a, b) => a.depth - b.depth);
  return <Scene background="#182b32" color="#e2f1e9">
    <Text x={30} y={36} size={23}>Işıkla, yüzeyle, hareketle.</Text><Text x={610} y={36} size={16} anchor="end" fill="#8db1b1">WebGL</Text>
    <defs><radialGradient id="surface-halo"><stop stopColor="#c5e8dc" stopOpacity={.12} /><stop offset="1" stopColor="#c5e8dc" stopOpacity={0} /></radialGradient></defs>
    <circle cx={320} cy={173} r={157} fill="url(#surface-halo)" /><ellipse cx={321} cy={291} rx={91} ry={13} fill="#07171e" opacity={.45} />
    {triangles.map(triangle => <polygon key={triangle.index} points={triangle.points} fill={triangle.color} fillOpacity={material === 2 ? .12 : 1} stroke={material === 2 ? '#b7e3d8' : triangle.color} strokeWidth={material === 2 ? 1.1 : .8} strokeOpacity={material === 2 ? .65 : 1} />)}
    {['Mat', 'Parlak', 'Çizgi'].map((name, i) => <g key={name} transform={`translate(${238 + i * 83} 332)`}><circle cx={-17} cy={-4} r={7} fill={['#83b0a7', '#c4aed4', '#233b42'][i]} stroke={material === i ? '#dff4e8' : '#719d9d'} strokeWidth={material === i ? 2 : .8} /><Text x={-3} y={1} size={13} fill={material === i ? '#d7ede2' : '#779a9d'}>{name}</Text></g>)}
  </Scene>;
}
