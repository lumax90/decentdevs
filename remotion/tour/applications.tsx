import { useCurrentFrame } from 'remotion';
import { Check, Cursor, Dots, enter, mix, progress, Scene, smooth, Text } from './shared';

export function WebAppScene() {
  const f = useCurrentFrame();
  const booked = f >= 146;
  const selected = f >= 63;
  const slot = f >= 111;
  const cursor = f < 90 ? [mix(586, 244, smooth(progress(f, 23, 60))), mix(300, 211, smooth(progress(f, 23, 60)))] : f < 128 ? [mix(244, 525, smooth(progress(f, 86, 108))), mix(211, 181, smooth(progress(f, 86, 108)))] : [mix(525, 482, smooth(progress(f, 126, 143))), mix(181, 274, smooth(progress(f, 126, 143)))];
  return <Scene background="#ebe5f3" color="#4b3d5c">
    <Text x={30} y={36} size={23}>Randevular, bir arada.</Text>
    <rect x={35} y={59} width={576} height={273} rx={18} fill="#b5a5c8" opacity={.15} /><rect x={29} y={52} width={576} height={273} rx={18} fill="#fdfbff" />
    <path d="M29 89h576M134 89v236" stroke="#e9e1f0" /><Dots x={46} y={70} /><Text x={177} y={75} size={15}>plan.</Text><Text x={579} y={74} size={11} anchor="end" fill="#b0a0be">Takvim / Şubat</Text>
    {['Genel bakış', 'Takvim', 'Kişiler'].map((name, i) => <g key={name}><rect x={40} y={111 + i * 42} width={83} height={31} rx={9} fill={i === 1 ? '#e3d5f3' : 'none'} /><Text x={52} y={131 + i * 42} size={11} fill={i === 1 ? '#795497' : '#a493b1'}>{name}</Text></g>)}
    <Text x={155} y={122} size={19}>Şubat 2027</Text>
    {'P S Ç P C C P'.split(' ').map((day, i) => <Text key={i} x={163 + i * 27} y={148} size={10} anchor="middle" fill="#a79ab2">{day}</Text>)}
    {Array.from({ length: 28 }, (_, i) => {
      const x = 151 + i % 7 * 27, y = 163 + Math.floor(i / 7) * 35;
      const active = selected && i === 10;
      return <g key={i}><rect x={x} y={y} width={24} height={27} rx={8} fill={active ? '#c4a9e3' : '#f7f3fa'} /><Text x={x + 12} y={y + 18} size={11} anchor="middle" fill={active ? '#fff' : '#8d7b9e'}>{i + 1}</Text></g>;
    })}
    <path d="M367 107v196" stroke="#eee6f4" />
    <g opacity={selected ? 1 : .36}>
      <Text x={390} y={124} size={18}>11 Şubat, Perşembe</Text><Text x={390} y={147} size={11} fill="#9c8aa9">Tanışmak için bir saat seç.</Text>
      {['09:00', '09:30', '10:00'].map((time, i) => <g key={time}><rect x={390 + i % 2 * 94} y={168 + Math.floor(i / 2) * 37} width={83} height={28} rx={9} fill={slot && i === 1 ? '#d8e8c8' : '#eee7f5'} /><Text x={431 + i % 2 * 94} y={187 + Math.floor(i / 2) * 37} size={12} anchor="middle" fill={slot && i === 1 ? '#66834e' : '#977ea9'}>{time}</Text></g>)}
      <rect x={390} y={255} width={184} height={39} rx={12} fill={booked ? '#cfe5b9' : '#c4a9e3'} /><Text x={482} y={280} size={14} anchor="middle" fill={booked ? '#5b7846' : '#fff'}>{booked ? 'Takviminde yerini aldı ✓' : 'Randevuyu oluştur'}</Text>
    </g>
    {f < 163 && <Cursor x={cursor[0]} y={cursor[1]} click={Math.max(0, 1 - Math.abs(f - 63) / 12, 1 - Math.abs(f - 111) / 12, 1 - Math.abs(f - 146) / 12)} />}
  </Scene>;
}

function WeatherPhone({ x, android, night, frame }: { x: number; android: boolean; night: number; frame: number }) {
  return <g transform={`translate(${x} ${56 + (1 - enter(frame, android ? 12 : 3)) * 24})`} opacity={enter(frame, android ? 12 : 3)}>
    <rect x={5} y={7} width={142} height={259} rx={25} fill="#7594a0" opacity={.15} /><rect width={142} height={259} rx={25} fill="#293c48" /><rect x={6} y={6} width={130} height={247} rx={20} fill={night > .5 ? '#293e60' : '#f5fbfc'} />
    {android ? <circle cx={71} cy={13} r={3} fill="#293c48" /> : <rect x={51} y={9} width={40} height={9} rx={5} fill="#293c48" />}
    <Text x={20} y={49} size={13} fill={night > .5 ? '#bccde4' : '#7d9baa'}>İstanbul</Text><Text x={71} y={94} size={37} anchor="middle" fill={night > .5 ? '#f2f5f9' : '#405e6b'}>{night > .5 ? '19°' : '24°'}</Text>
    <g transform="translate(71 138)"><circle r={24} fill={night > .5 ? '#dce8e7' : '#e8ca7b'} />{night > .5 ? <circle cx={12} cy={-9} r={23} fill="#293e60" /> : [0, 60, 120, 180, 240, 300].map(a => <path key={a} d="M0-31v-8" transform={`rotate(${a + frame * .15})`} stroke="#ddc16e" strokeWidth={2} strokeLinecap="round" />)}</g>
    <Text x={71} y={187} size={11} anchor="middle" fill={night > .5 ? '#b2c6df' : '#94aab2'}>{night > .5 ? 'Sakin bir akşam.' : 'Güzel bir gün.'}</Text>
    <rect x={31} y={207} width={80} height={25} rx={12} fill={night > .5 ? '#526e94' : '#cce5eb'} /><circle cx={50 + night * 42} cy={219.5} r={9} fill="#fff" />
    <rect x={49} y={246} width={44} height={3} rx={2} fill="#8d9caa" />
  </g>;
}

export function FlutterScene() {
  const f = useCurrentFrame(), night = smooth(progress(f, 100, 119));
  return <Scene background="#deedf2" color="#416474">
    <Text x={320} y={34} size={23} anchor="middle">Tek fikir, iki dünya.</Text>
    <path d="M243 177h154" stroke="#98b7c7" strokeWidth={1.5} strokeDasharray="4 6" strokeDashoffset={-f * .3} />
    <g transform={`translate(320 170) rotate(${Math.sin(f / 30) * 3})`}><path d="M-26 5L4-26h24L-14 17Z" fill="#7ac7e0" /><path d="M-12 19L3 4l25 25H2Z" fill="#498cb6" /><path d="M3 4l12-12 13 13-12 12Z" fill="#afddeb" /></g>
    <WeatherPhone x={89} android={false} night={night} frame={f} /><WeatherPhone x={409} android night={night} frame={f} />
    <Text x={160} y={342} size={13} anchor="middle" fill="#83a0ae">iOS</Text><Text x={480} y={342} size={13} anchor="middle" fill="#83a0ae">Android</Text>
    <Text x={320} y={246} size={14} anchor="middle" fill="#80a6b8">Flutter</Text>
    {f > 76 && f < 137 && <Cursor x={mix(342, 170, progress(f, 77, 98))} y={mix(323, 277, progress(f, 77, 98))} click={Math.max(0, 1 - Math.abs(f - 102) / 14)} />}
  </Scene>;
}

function Landscape({ x, y, width, height, sunset = false }: { x: number; y: number; width: number; height: number; sunset?: boolean }) {
  return <g transform={`translate(${x} ${y})`}><rect width={width} height={height} rx={13} fill={sunset ? '#edc7b3' : '#d8e5cf'} /><circle cx={width * .72} cy={height * .25} r={18} fill={sunset ? '#f6e0b8' : '#fbefc4'} /><path d={`M0 ${height * .69}L${width * .3} ${height * .34} ${width * .58} ${height * .74} ${width} ${height * .4}V${height}H0Z`} fill={sunset ? '#c79693' : '#adc09e'} /><path d={`M0 ${height * .9}L${width * .55} ${height * .55} ${width} ${height * .81}V${height}H0Z`} fill={sunset ? '#a7747d' : '#779572'} /></g>;
}

export function SwiftScene() {
  const f = useCurrentFrame(), swipe = smooth(progress(f, 63, 102)), liked = f > 142;
  return <Scene background="#f3e4d9" color="#76574b">
    <Text x={30} y={38} size={23}>Bir dokunuş kadar doğal.</Text><Text x={608} y={38} anchor="end" size={16} fill="#ba8a71">Swift</Text>
    <g transform="translate(234 56)">
      <rect x={5} y={7} width={173} height={274} rx={29} fill="#a1867a" opacity={.17} /><rect width={173} height={274} rx={29} fill="#342f33" /><rect x={6} y={6} width={161} height={262} rx={24} fill="#fffaf7" /><rect x={62} y={11} width={49} height={10} rx={5} fill="#342f33" />
      <Text x={20} y={49} size={23}>Anlar.</Text><Text x={20} y={67} size={11} fill="#b2998e">Küçük şeyleri sakla.</Text>
      <defs><clipPath id="swift-gallery"><rect x={14} y={79} width={145} height={147} rx={13} /></clipPath></defs>
      <g clipPath="url(#swift-gallery)"><Landscape x={14 - swipe * 156} y={79} width={145} height={147} /><Landscape x={170 - swipe * 156} y={79} width={145} height={147} sunset /></g>
      <Text x={24} y={247} size={11} fill="#a7887b">{swipe < .5 ? 'Biraz doğa' : 'Akşam ışığı'}</Text><path d="M137 240c-8-12-18 3 0 12 18-9 8-24 0-12" fill={liked ? '#d08b87' : 'none'} stroke="#c8a19a" strokeWidth={1.5} />
      <rect x={63} y={261} width={46} height={3} rx={2} fill="#c5b4aa" />
    </g>
    <g transform={`translate(59 ${140 + Math.sin(f / 32) * 3}) rotate(-8 66 50)`} opacity={enter(f, 13)}><rect width={133} height={127} rx={17} fill="#fff9ef" /><Landscape x={9} y={9} width={115} height={87} /><Text x={66} y={115} anchor="middle" size={12} fill="#a28e7d">Kendine bir an.</Text></g>
    <g opacity={enter(f, 148)} transform={`translate(${mix(660, 438, enter(f, 148))} 149)`}><rect width={173} height={63} rx={17} fill="#fffaf4" /><circle cx={26} cy={31} r={12} fill="#e3d8c4" /><Check x={26} y={31} size={14} color="#8b9574" /><Text x={48} y={37} size={15}>Sende kalsın.</Text></g>
    {f > 47 && f < 119 && <g opacity={Math.sin(progress(f, 47, 119) * Math.PI)}><path d="M386 241h-120" stroke="#b49688" strokeWidth={2} strokeDasharray="3 7" /><circle cx={386 - swipe * 111} cy={241} r={10} fill="#fff8" stroke="#b49688" /></g>}
    {f >= 122 && f < 160 && <Cursor x={mix(439, 372, progress(f, 123, 140))} y={mix(320, 298, progress(f, 123, 140))} click={Math.max(0, 1 - Math.abs(f - 144) / 12)} />}
  </Scene>;
}

export function KotlinScene() {
  const f = useCurrentFrame(), sheet = smooth(progress(f, 90, 112)), saved = f > 159;
  return <Scene background="#e9e1f4" color="#594c6f">
    <Text x={30} y={36} size={23}>Günün ritmine uyar.</Text><Text x={610} y={36} anchor="end" size={16} fill="#a28bbd">Kotlin</Text>
    <circle cx={323} cy={198} r={138} fill="#ddd0ef" />
    <g transform="translate(228 51)"><rect x={6} y={7} width={184} height={281} rx={27} fill="#9e88b5" opacity={.15} /><rect width={184} height={281} rx={27} fill="#383040" /><rect x={6} y={6} width={172} height={269} rx={22} fill="#fcf9ff" /><circle cx={92} cy={13} r={3} fill="#383040" />
      <Text x={22} y={49} size={24}>Bugün.</Text><Text x={22} y={69} size={11} fill="#ab96bd">Aklında yer aç.</Text>
      {['Bir kahve molası', 'İyi bir kitap', 'Yeni bir fikir'].map((text, i) => <g key={text} transform={`translate(20 ${105 + i * 39})`}><circle cx={7} cy={-3} r={8} fill={f > 43 + i * 28 ? '#c9dfb1' : 'none'} stroke="#b6a4c9" />{f > 43 + i * 28 && <Check x={7} y={-3} size={10} />}<Text x={25} y={1} size={12} fill="#8b789f">{text}</Text></g>)}
      <circle cx={143} cy={224} r={20} fill="#cdb5eb" /><path d="M134 224h18m-9-9v18" stroke="#6f548b" strokeWidth={2} strokeLinecap="round" />
      <defs><clipPath id="kotlin-screen"><rect x={6} y={6} width={172} height={269} rx={22} /></clipPath></defs><g clipPath="url(#kotlin-screen)"><g transform={`translate(0 ${281 - sheet * 128})`}><path d="M6 22Q6 0 27 0h130q21 0 21 22v102H6Z" fill="#e6d8f4" /><rect x={71} y={8} width={42} height={3} rx={2} fill="#bca4d4" /><Text x={22} y={37} size={16}>Bir de şunu not et.</Text><rect x={20} y={49} width={144} height={27} rx={8} fill="#fcf9ff" /><Text x={30} y={67} size={11} fill="#9d82b4">{saved ? 'Yarın güzel şeyler var.' : 'Yarın güzel şeyler…'}</Text><rect x={20} y={89} width={144} height={28} rx={12} fill={saved ? '#cadfaa' : '#bb9ddb'} /><Text x={92} y={108} size={12} fill={saved ? '#6d814b' : '#fff'} anchor="middle">{saved ? 'Kaydedildi ✓' : 'Kaydet'}</Text></g></g>
    </g>
    <g opacity={enter(f, 165)} transform={`translate(439 ${172 + (1 - enter(f, 165)) * 10})`}><rect width={170} height={57} rx={16} fill="#fbf7ff" /><Check x={25} y={29} size={15} /><Text x={45} y={35} size={14}>Aklın rahat olsun.</Text></g>
    <Text x={53} y={197} size={17} fill="#aa8ec0" mono>bir not.</Text><Text x={53} y={222} size={17} fill="#aa8ec0" mono>bir dokunuş.</Text>
  </Scene>;
}
