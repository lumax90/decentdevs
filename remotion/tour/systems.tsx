import { useCurrentFrame } from 'remotion';
import { Check, Dots, enter, mix, Packet, progress, Scene, Text } from './shared';

export function NextScene() {
  const f = useCurrentFrame();
  const blocks = [progress(f, 59, 77), progress(f, 90, 108), progress(f, 122, 140)];
  return <Scene background="#181c27" color="#eae7f4">
    <circle cx={578} cy={220} r={187} fill="#c9b7f7" opacity={.025} />
    <circle cx={44} cy={35} r={17} fill="#f4f1f9" /><Text x={44} y={42} size={23} fill="#232132" anchor="middle">N</Text><Text x={72} y={43} size={23}>Hazır olan, hemen ekranda.</Text>
    <path d="M93 188H258M279 188h65" fill="none" stroke="#4d4b63" strokeWidth={2} strokeDasharray="5 7" />
    <rect x={27} y={157} width={104} height={63} rx={18} fill="#292d3a" stroke="#454858" /><Text x={79} y={185} anchor="middle" size={17}>İstek</Text><Text x={79} y={205} anchor="middle" size={11} fill="#9292a8" mono>GET /idea</Text>
    <g transform={`translate(181 ${118 + (1 - enter(f, 12)) * 12})`} opacity={enter(f, 12)}>
      <rect width={122} height={145} rx={20} fill="#272a39" stroke="#51485f" />
      {[0, 1, 2].map(i => <g key={i} transform={`translate(16 ${25 + i * 37})`}><rect width={90} height={25} rx={7} fill="#363346" /><circle cx={13} cy={12} r={3} fill={f > 34 + i * 30 ? '#d5f5a1' : '#777287'} /><path d="M28 9h48M28 15h30" stroke="#777287" strokeWidth={2} /></g>)}
      <Text x={61} y={168} anchor="middle" size={13} fill="#a19caf">Sunucu</Text>
    </g>
    <Packet from={[129, 188]} to={[180, 188]} start={15} duration={19} color="#e9dfb4" size={5} />
    {[38, 70, 102].map(start => <Packet key={start} from={[304, 188]} to={[354, 188]} start={start} duration={19} color="#c9b7f7" size={6} />)}
    <g transform="translate(352 84)">
      <rect x={4} y={7} width={259} height={221} rx={17} fill="#080b14" opacity={.6} /><rect width={259} height={221} rx={17} fill="#f1edf7" />
      <Dots x={17} y={17} color="#b0a2be" /><rect x={75} y={13} width={111} height={8} rx={4} fill="#dbd3e4" />
      <g transform="translate(18 43)">
        <rect width={150} height={14} rx={5} fill="#ded6e8" /><rect y={24} width={96} height={6} rx={3} fill="#e6deee" />
        <g opacity={blocks[0]}><rect x={-1} y={-5} width={215} height={40} fill="#f1edf7" /><Text x={0} y={14} size={23} fill="#4a3b5a">İyi bir başlangıç.</Text><Text x={0} y={34} size={11} fill="#9585a3">Sayfa parça parça hayat bulur.</Text></g>
        {[0, 1, 2].map(i => <rect key={i} x={i * 77} y={56} width={68} height={78} rx={11} fill="#e3dbee" />)}
        {[0, 1, 2].map(i => <g key={i} opacity={blocks[1]} transform={`translate(${i * 77} ${56 + (1 - blocks[1]) * 8})`}><rect width={68} height={78} rx={11} fill={['#cbb7e8', '#c8dcb0', '#e9c7b2'][i]} /><circle cx={34} cy={29} r={13} fill="#fff6" /><path d="M14 55h39M14 63h26" stroke="#66517355" strokeWidth={3} /></g>)}
        <rect y={151} width={223} height={10} rx={5} fill="#e3dbee" /><g opacity={blocks[2]}><rect y={145} width={223} height={24} rx={8} fill="#d5c6e7" /><Text x={111} y={161} size={10} fill="#71617f" anchor="middle">Her şey yerli yerinde. ↗</Text></g>
      </g>
    </g>
    <Text x={31} y={334} size={14} fill="#aaa1bb" mono>Next.js / streaming</Text><Text x={610} y={334} size={14} fill="#c6d7b4" anchor="end">{f > 145 ? '✓ hazır' : 'şekilleniyor…'}</Text>
  </Scene>;
}

function Gear({ frame }: { frame: number }) {
  const points = Array.from({ length: 48 }, (_, i) => {
    const radius = i % 4 === 0 || i % 4 === 3 ? 73 : 82;
    const angle = i / 48 * Math.PI * 2;
    return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
  }).join(' ');
  return <g transform="translate(323 184)">
    <ellipse cy={93} rx={81} ry={13} fill="#815f49" opacity={.12} />
    <polygon points={points} fill="#68493a" transform={`rotate(${Math.min(frame, 177) * .95})`} />
    <circle r={61} fill="#f2d8bc" stroke="#9b7658" strokeWidth={2} /><circle r={49} fill="#deaf88" /><Text x={0} y={22} anchor="middle" size={66} weight={750} fill="#634536">R</Text>
  </g>;
}

export function RustScene() {
  const f = useCurrentFrame();
  return <Scene background="#f0d7bd" color="#694b3b">
    <Text x={31} y={38} size={23}>Arka plandaki ince iş.</Text><Text x={609} y={37} anchor="end" size={17} fill="#9b755b" mono>Rust</Text>
    <path d="M28 243h586" stroke="#bc9879" strokeWidth={2} strokeDasharray="5 8" strokeDashoffset={-Math.min(f, 172) * .8} />
    <rect x={44} y={225} width={558} height={29} rx={14} fill="#d6b392" />
    {Array.from({ length: 19 }, (_, i) => <circle key={i} cx={63 + i * 29} cy={239} r={5} fill="#b68b69" opacity={.65} />)}
    <Gear frame={f} />
    {[0, 1, 2].map(i => {
      const p = progress(f, 7 + i * 42, 88 + i * 42);
      const x = mix(53, 480 + i * 52, p);
      const hidden = x > 239 && x < 407;
      const finished = x >= 407;
      return <g key={i} opacity={f > 7 + i * 42 && !hidden ? 1 : 0} transform={`translate(${x} ${198 - Math.sin(p * Math.PI) * 2})`}>
        <path d="M-19-19h38l8-7h-38Z" fill={finished ? '#b9d69b' : '#eedfc9'} /><path d="M19-19l8-7v38l-8 7Z" fill={finished ? '#9ab37f' : '#bd9d7f'} /><rect x={-19} y={-19} width={38} height={38} rx={4} fill={finished ? '#d6e7bd' : '#fbecd9'} stroke={finished ? '#a4bb8b' : '#c8a789'} />
        {finished ? <Check x={0} y={0} size={18} /> : <Text x={0} y={6} size={15} anchor="middle" mono>{`0${i + 1}`}</Text>}
      </g>;
    })}
    <Text x={95} y={107} size={14} fill="#a58469" anchor="middle" mono>işler</Text><Text x={538} y={107} size={14} fill="#a58469" anchor="middle" mono>sonuçlar</Text>
    <g opacity={enter(f, 175)} transform={`translate(323 ${294 + (1 - enter(f, 175)) * 7})`}><rect x={-110} y={-17} width={220} height={35} rx={17} fill="#f9ecd9" /><Text x={0} y={5} size={15} anchor="middle" fill="#7f634f">İşini sessizce iyi yapar. ✓</Text></g>
    <Text x={31} y={337} size={13} fill="#a17e61" mono>SAHİPLİK · KONTROL · AKIŞ</Text>
  </Scene>;
}

export function DataScene() {
  const f = useCurrentFrame();
  const rows = ['Orbit', 'Sakin', 'Luma'];
  const query = 'SELECT * FROM ideas;';
  return <Scene background="#e0ebef" color="#3a5361">
    <Text x={30} y={38} size={23}>Veri, yerini bulunca.</Text><Text x={609} y={38} anchor="end" size={15} fill="#829da9" mono>PostgreSQL</Text>
    <g transform={`translate(124 ${162 + (1 - enter(f, 3)) * 25})`} opacity={enter(f, 3)}>
      <ellipse cy={109} rx={70} ry={14} fill="#708f9e" opacity={.12} />
      {[2, 1, 0].map(i => <g key={i} transform={`translate(0 ${i * 29})`}><path d="M-61 0v42c0 29 122 29 122 0V0" fill={['#98bdcc', '#abcbd6', '#bfd8e1'][i]} stroke="#7ba6b7" /><ellipse rx={61} ry={20} fill="#d7e7ed" stroke="#8ab0bf" /><path d="M-44 20c24 11 66 11 88 0" fill="none" stroke="#729caa" opacity={.5} /></g>)}
      <Text x={0} y={66} anchor="middle" size={32} fill="#4d7b8e">{f > 163 ? '03' : '•••'}</Text>
    </g>
    <path d="M185 190h100" stroke="#9ab8c4" strokeWidth={2} strokeDasharray="4 7" />
    {[40, 82, 124].map(start => <Packet key={start} from={[186, 190]} to={[285, 190]} start={start} duration={24} color="#6797ac" size={6} />)}
    <rect x={223} y={65} width={350} height={37} rx={11} fill="#f6fafb" /><Text x={240} y={90} size={17} fill="#688796" mono>{query.slice(0, Math.max(0, Math.floor((f - 8) / 1.4)))}{f < 42 ? '|' : ''}</Text>
    <g transform="translate(284 123)">
      <rect x={4} y={6} width={326} height={176} rx={17} fill="#7799a8" opacity={.15} /><rect width={326} height={176} rx={17} fill="#f8fbfc" />
      <path d="M0 36h326" stroke="#dbe6ea" /><Text x={18} y={25} size={12} fill="#8ba3ae" mono>ID</Text><Text x={79} y={25} size={12} fill="#8ba3ae" mono>FİKİR</Text><Text x={240} y={25} size={12} fill="#8ba3ae" mono>DURUM</Text>
      {rows.map((label, i) => {
        const p = enter(f, 65 + i * 42);
        return <g key={label} transform={`translate(${(1 - p) * 16} ${63 + i * 43})`} opacity={p}><Text x={18} y={0} size={15} fill="#99afb9" mono>0{i + 1}</Text><Text x={79} y={0} size={19}>{label}</Text><rect x={237} y={-16} width={67} height={24} rx={12} fill="#d9e8c8" /><Text x={270} y={1} size={12} fill="#63834b" anchor="middle">hazır ✓</Text>{i < 2 && <path d="M16 17h292" stroke="#e7edef" />}</g>;
      })}
    </g>
    <Text x={30} y={337} size={13} fill="#809daa" mono>{f > 167 ? '✓ 3 kayıt. Tek bir doğru kaynak.' : 'sorgu → kayıtlar → anlam'}</Text>
  </Scene>;
}
