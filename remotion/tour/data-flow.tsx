import { useCurrentFrame } from 'remotion';
import { Check, Cursor, enter, mix, Packet, progress, Scene, smooth, Text } from './shared';

function MessageCard({ x, y, name, received, outgoing = false }: { x: number; y: number; name: string; received: boolean; outgoing?: boolean }) {
  return <g transform={`translate(${x} ${y})`}><rect x={4} y={6} width={158} height={133} rx={18} fill="#678a74" opacity={.12} /><rect width={158} height={133} rx={18} fill="#f8fff6" /><circle cx={25} cy={25} r={12} fill="#dceacb" /><Text x={25} y={30} anchor="middle" size={12} fill="#729364">{name[0]}</Text><Text x={45} y={30} size={15}>{name}</Text><circle cx={136} cy={25} r={3} fill="#92b66e" /><path d="M15 48h128" stroke="#e2edde" /><g opacity={received ? 1 : .15}><rect x={15} y={63} width={113} height={31} rx={11} fill={outgoing ? '#cadfb0' : '#e1efcf'} /><Text x={29} y={83} size={13}>Merhaba!</Text><Text x={139} y={116} size={9} anchor="end" fill="#97ab89">{outgoing ? 'gönderildi ✓' : received ? 'şimdi geldi ✓' : 'bağlı'}</Text></g></g>;
}

export function NodeScene() {
  const f = useCurrentFrame();
  return <Scene background="#e0ecd9" color="#45623f">
    <Text x={30} y={37} size={23}>Her ekran aynı anda.</Text><Text x={610} y={37} size={16} anchor="end" fill="#8aa778">Node.js</Text>
    <path d="M208 193h81m59-6 62-72m-62 80 62 76" fill="none" stroke="#aac39b" strokeWidth={2} strokeDasharray="4 7" />
    <MessageCard x={45} y={126} name="Deniz" received={f > 27} outgoing />
    <g transform={`translate(321 188) scale(${enter(f, 5)})`}><path d="M0-40 35-20v40L0 40-35 20v-40Z" fill="#6c9255" /><Text x={0} y={7} anchor="middle" size={27} fill="#f0f7e8">N</Text></g>
    <MessageCard x={424} y={67} name="Ece" received={f > 92} /><MessageCard x={424} y={218} name="Mert" received={f > 101} />
    <Packet from={[207, 193]} to={[287, 193]} start={36} duration={28} color="#8cab67" size={7} /><Packet from={[350, 176]} to={[423, 116]} start={67} duration={25} color="#90b26b" size={6} /><Packet from={[350, 202]} to={[423, 271]} start={67} duration={34} color="#b2c878" size={6} />
    <g opacity={enter(f, 116)}><rect x={52} y={285} width={337} height={41} rx={15} fill="#f1f8e9" /><Check x={78} y={305} size={15} /><Text x={99} y={311} size={16}>Herkes aynı konuşmada.</Text></g>
    {f < 55 && <Cursor x={mix(340, 165, progress(f, 4, 25))} y={mix(301, 206, progress(f, 4, 25))} click={Math.max(0, 1 - Math.abs(f - 29) / 13)} />}
  </Scene>;
}

export function PythonScene() {
  const f = useCurrentFrame(), values = [12, 8, 12, 21, 4];
  return <Scene background="#eee7d3" color="#655b3e">
    <Text x={30} y={37} size={23}>Karmaşadan anlamlı bir sonuca.</Text><Text x={610} y={37} size={16} anchor="end" fill="#a69867">Python</Text>
    {values.map((value, i) => {
      const p = smooth(progress(f, 13 + i * 13, 60 + i * 13));
      return <g key={i} opacity={p < 1 ? 1 : 0} transform={`translate(${mix(39 + i % 2 * 52, 275, p)} ${mix(98 + i * 37, 188, p)}) rotate(${mix((i - 2) * 7, 0, p)})`}><rect width={65} height={43} rx={10} fill={i === 2 ? '#ead7b0' : '#fff9e9'} stroke="#d5c69f" /><Text x={32} y={28} size={20} anchor="middle">{value}</Text></g>;
    })}
    <path d="M206 176h44m95 0h41" stroke="#c3b98b" strokeWidth={2} strokeDasharray="4 7" />
    <g transform={`translate(299 186) scale(${enter(f, 1)})`}><rect x={-53} y={-64} width={106} height={128} rx={28} fill="#e0d4ad" /><path d="M-29-1v-22q0-19 20-19h32v27H-7V2Z" fill="#739aac" /><path d="M29 1v22q0 19-20 19h-32V15H7V-2Z" fill="#d4b866" /><circle cx={-9} cy={-31} r={3} fill="#eef3e9" /><circle cx={9} cy={31} r={3} fill="#fff7d9" /></g>
    <g transform={`translate(395 ${90 + (1 - enter(f, 93)) * 16})`} opacity={enter(f, 93)}><rect x={4} y={6} width={210} height={224} rx={19} fill="#a89e7f" opacity={.13} /><rect width={210} height={224} rx={19} fill="#fffcf2" /><Text x={19} y={32} size={17}>Düzenli bir görünüm.</Text><Text x={19} y={53} size={11} fill="#afa27b">4 farklı kayıt</Text>
      {[4, 8, 12, 21].map((value, i) => {
        const p = enter(f, 98 + i * 14), h = value * 4.6 * p;
        return <g key={value}><rect x={24 + i * 43} y={174 - h} width={27} height={h} rx={6} fill={['#b8c99c', '#94b6a9', '#7c9faf', '#c8b56f'][i]} /><Text x={37 + i * 43} y={196} anchor="middle" size={12} fill="#958766">{value}</Text></g>;
      })}
    </g>
    <Text x={35} y={341} size={13} fill="#a69872">Topla. Düzenle. Anlamlandır.</Text>
  </Scene>;
}

export function GraphQLScene() {
  const f = useCurrentFrame();
  const selected = [f > 23, false, f > 47, false];
  return <Scene background="#f0e0eb" color="#6e4762">
    <Text x={30} y={37} size={23}>Tam gereken kadar veri.</Text><Text x={610} y={37} size={16} anchor="end" fill="#b582a5">GraphQL</Text>
    <rect x={31} y={80} width={173} height={220} rx={20} fill="#fff7fc" /><Text x={51} y={113} size={18}>Neye ihtiyacın var?</Text>
    {['İsim', 'Tüm notlar', 'Durum', 'Geçmiş'].map((label, i) => <g key={label} transform={`translate(52 ${149 + i * 36})`}><rect x={0} y={-11} width={15} height={15} rx={4} fill={selected[i] ? '#d6b4cf' : '#f5edf3'} stroke="#d1b8c9" />{selected[i] && <Check x={7} y={-3} size={10} color="#8e597e" />}<Text x={26} y={1} size={14} fill={selected[i] ? '#8c5c7c' : '#c1aabc'}>{label}</Text></g>)}
    <path d="M204 191h52m99 0h61" stroke="#c597b4" strokeWidth={2} strokeDasharray="5 7" />
    <g transform="translate(307 188)" opacity={enter(f, 12)}><path d="M0-52 45-26v52L0 52-45 26v-52Z M-45-26L0 52 45-26Z" fill="none" stroke="#bc79a5" strokeWidth={2} />{[[0, -52], [45, -26], [45, 26], [0, 52], [-45, 26], [-45, -26]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill="#a76691" />)}<Text x={0} y={83} anchor="middle" size={13} fill="#b88eab">tek istek</Text></g>
    <Packet from={[204, 191]} to={[255, 191]} start={64} duration={23} color="#b57ca1" /><Packet from={[356, 191]} to={[418, 191]} start={97} duration={25} color="#b57ca1" />
    <g transform={`translate(420 ${99 + (1 - enter(f, 122)) * 14})`} opacity={enter(f, 122)}><rect x={4} y={7} width={189} height={196} rx={23} fill="#a97899" opacity={.13} /><rect width={189} height={196} rx={23} fill="#fffafd" /><circle cx={94} cy={57} r={28} fill="#ead4e3" /><Text x={94} y={67} anchor="middle" size={28} fill="#9b6b8b">D</Text><Text x={94} y={117} anchor="middle" size={24}>Deniz</Text><rect x={41} y={139} width={107} height={26} rx={13} fill="#dbe9cc" /><circle cx={55} cy={152} r={3} fill="#8cae6a" /><Text x={101} y={157} anchor="middle" size={12} fill="#719057">çevrimiçi</Text></g>
    <Text x={31} y={338} size={14} fill="#b28da6" mono>{f < 66 ? '{ isim, durum }' : 'Sadece istediğin alanlar.'}</Text>
  </Scene>;
}

export function RedisScene() {
  const f = useCurrentFrame(), cached = f > 88;
  const second = f > 125;
  return <Scene background="#f2e1dd" color="#785550">
    <Text x={30} y={37} size={23}>İhtiyacın, elinin altında.</Text><Text x={610} y={37} size={16} anchor="end" fill="#ba8f87">Redis</Text>
    <path d="M144 176h92m97 0h180" stroke="#d3b0a9" strokeWidth={2} strokeDasharray="4 7" /><Text x={451} y={157} anchor="middle" size={11} fill="#c1a19b">ilk arama</Text>
    <rect x={31} y={131} width={117} height={90} rx={19} fill="#fff9f3" /><circle cx={62} cy={163} r={12} fill="#ead5c7" /><Text x={92} y={170} size={14} anchor="middle">Profil</Text><path d="M49 194h79" stroke="#d9bcb4" strokeWidth={4} strokeLinecap="round" />
    <g transform="translate(285 178)">{[2, 1, 0].map(i => <g key={i} transform={`translate(0 ${i * 20})`}><path d="M-52-9 0-28 52-9 0 11Z" fill={['#d39b92', '#c28882', '#b27673'][i]} /><path d="M-52-9v12L0 23V11Z" fill="#b77a74" /><path d="M52-9v12L0 23V11Z" fill="#9e6964" /></g>)}<Text x={0} y={-53} size={16} anchor="middle">Yakın bellek</Text>{cached && <Check x={0} y={-7} size={18} color="#fff4e4" />}</g>
    <g transform="translate(561 158)"><path d="M-41 0v56c0 22 82 22 82 0V0" fill="#d9c8c0" stroke="#b99f95" /><ellipse rx={41} ry={14} fill="#f0e4dc" stroke="#b99f95" /><Text x={0} y={94} anchor="middle" size={12} fill="#b6978f">ana kaynak</Text></g>
    <Packet from={[149, 176]} to={[516, 176]} start={13} duration={42} color="#c4867b" size={6} /><Packet from={[514, 183]} to={[287, 183]} start={59} duration={28} color="#b4b779" size={6} />
    <Packet from={[147, 176]} to={[235, 176]} start={124} duration={14} color="#be8b80" size={6} /><Packet from={[235, 184]} to={[148, 184]} start={141} duration={14} color="#a3b975" size={6} />
    <g opacity={enter(f, 158)}><rect x={36} y={270} width={565} height={52} rx={18} fill="#fcf5eb" /><Check x={65} y={296} size={17} /><Text x={92} y={302} size={18}>Bir kez bulundu. Şimdi hemen burada.</Text></g>
    {cached && <Text x={285} y={293} anchor="middle" size={12} fill="#ad887a" opacity={second ? 0 : 1}>saklandı ✓</Text>}
  </Scene>;
}
