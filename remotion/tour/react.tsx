import { useCurrentFrame } from 'remotion';
import { Check, Cursor, enter, mix, progress, Scene, Text } from './shared';

function Atom({ frame }: { frame: number }) {
  return <g transform={`translate(131 158) rotate(${frame * .22})`} fill="none" stroke="#50849b" strokeWidth={2.5} opacity={enter(frame, 3)}>
    {[0, 60, 120].map(angle => <ellipse key={angle} rx={61} ry={22} transform={`rotate(${angle})`} />)}
    <circle r={8} fill="#50849b" stroke="none" />
    <circle cx={61 * Math.cos(frame / 25)} cy={22 * Math.sin(frame / 25)} r={5} fill="#50849b" stroke="#eae1f3" />
  </g>;
}

export function ReactScene() {
  const f = useCurrentFrame();
  const count = f < 82 ? 1 : f < 131 ? 2 : 3;
  const dark = progress(f, 148, 163);
  const panel = dark > .5 ? '#292932' : '#fffdfd';
  const ink = dark > .5 ? '#f4effb' : '#42374e';
  const cursorX = f < 119 ? mix(590, 486, progress(f, 59, 79)) : mix(486, 535, progress(f, 130, 148));
  const cursorY = f < 119 ? mix(300, 258, progress(f, 59, 79)) : mix(258, 102, progress(f, 130, 148));
  return <Scene background="#e9e0f1" color="#493958">
    <circle cx={79} cy={146} r={153} fill="#d9cbed" opacity={.42} />
    <Text x={30} y={38} size={23}>Küçük parçalar. Canlı arayüzler.</Text>
    <Atom frame={f} />
    <Text x={131} y={252} anchor="middle" size={26} weight={600}>React</Text>
    <Text x={131} y={275} anchor="middle" size={15} fill="#8b759f" mono>state → UI</Text>
    <path d="M212 152h30q18 0 18-18v-12q0-18 18-18h37M210 174h32q18 0 18 18v22q0 18 18 18h37" fill="none" stroke="#ad97c3" strokeWidth={1.5} strokeDasharray="4 6" strokeDashoffset={-f * .45} />
    {['<Card />', '<Button />', 'useState()'].map((label, i) => {
      const p = enter(f, 9 + i * 11);
      return <g key={label} transform={`translate(${mix(234, 270, p)} ${96 + i * 62})`} opacity={p}>
        <rect x={-41} y={-15} width={96} height={31} rx={9} fill={i === 2 ? '#cbdcba' : '#ddd0ec'} stroke="#c7b5d8" /><Text x={7} y={5} anchor="middle" size={14} fill="#685279" mono>{label}</Text>
      </g>;
    })}
    <g transform={`translate(347 ${73 + (1 - enter(f, 14)) * 18})`} opacity={enter(f, 14)}>
      <rect x={6} y={8} width={250} height={228} rx={24} fill="#a890bb" opacity={.18} />
      <rect width={250} height={228} rx={24} fill={panel} />
      <Text x={22} y={35} size={19} fill={ink}>Günlük tempo</Text>
      <rect x={165} y={17} width={41} height={23} rx={12} fill={dark > .5 ? '#c9b7f7' : '#e5dcec'} /><circle cx={177 + dark * 16} cy={28.5} r={8} fill={dark > .5 ? '#3c3150' : '#fff'} />
      <Text x={222} y={35} size={14} anchor="end" fill="#aa96b9">✳</Text>
      {['Bir fikir bul', 'İlk ekranı kur', 'Biraz özen ekle'].map((label, i) => {
        const checked = i < count;
        return <g key={label} transform={`translate(22 ${69 + i * 36})`}>
          <circle cx={9} cy={-3} r={9} fill={checked ? '#c7dea9' : 'none'} stroke={checked ? '#b1cc92' : '#c3b3d1'} />
          {checked && <Check x={9} y={-3} size={11} />}
          <Text x={29} y={3} size={15} fill={checked ? '#85956f' : ink}>{label}</Text>
        </g>;
      })}
      <rect x={21} y={167} width={208} height={40} rx={13} fill="#c9b7f7" /><Text x={125} y={193} anchor="middle" size={16} fill="#493557">{count === 3 ? 'Güzel oldu. ✓' : 'Bir adım daha'}</Text>
      <rect x={21} y={215} width={208} height={3} rx={2} fill="#dccdeb" /><rect x={21} y={215} width={208 * count / 3} height={3} rx={2} fill="#aa8acb" />
    </g>
    <Cursor x={cursorX} y={cursorY} click={Math.max(0, 1 - Math.abs(f - 82) / 14, 1 - Math.abs(f - 131) / 14, 1 - Math.abs(f - 150) / 14)} />
    <Text x={32} y={337} size={14} fill="#8b789b" mono>{f < 84 ? 'const [done, setDone] = useState(1)' : f < 132 ? 'setDone(2)  // arayüz güncellendi' : 'setDone(3)  // her parça birlikte'}</Text>
  </Scene>;
}
