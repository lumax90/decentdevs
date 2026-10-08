import { useCurrentFrame } from 'remotion';
import { Check, enter, mix, progress, Scene, smooth, Text } from './shared';

export function WorkflowScene() {
  const f = useCurrentFrame();
  const phase = f < 80 ? 0 : f < 141 ? 1 : 2;
  const x = f < 84 ? mix(46, 237, smooth(progress(f, 51, 84))) : mix(237, 428, smooth(progress(f, 113, 146)));
  const flying = f >= 51 && f < 84 || f >= 113 && f < 146;
  const lift = flying ? Math.sin(progress(f, f < 84 ? 51 : 113, f < 84 ? 84 : 146) * Math.PI) * 23 : 0;
  return <Scene background="#e7eddc" color="#46593d">
    <Text x={30} y={38} size={23}>İşler birbirine bağlanır.</Text><Text x={609} y={38} size={14} anchor="end" fill="#98a68a" mono>TEK PANEL / 03</Text>
    {['Yeni', 'İşlemde', 'Tamam'].map((label, i) => <g key={label} transform={`translate(${30 + i * 191} 77)`}>
      <rect width={177} height={234} rx={19} fill={i === 2 ? '#d7e4c6' : '#dde5d3'} />
      <circle cx={20} cy={26} r={4} fill={['#bbab7e', '#a2b486', '#7d9c61'][i]} /><Text x={33} y={32} size={17}>{label}</Text><Text x={155} y={32} size={14} anchor="end" fill="#93a180">{phase === i ? '1' : '0'}</Text>
      <rect x={16} y={147} width={145} height={39} rx={11} fill="#ffffff33" /><path d="M32 161h87M32 173h56" stroke="#a0b19144" strokeWidth={3} strokeLinecap="round" />
      <rect x={16} y={196} width={145} height={21} rx={8} fill="#ffffff1a" />
    </g>)}
    <g transform={`translate(${x} ${134 - lift + (1 - enter(f, 7)) * 20}) rotate(${flying ? -3 : 0} 72 39)`} opacity={enter(f, 7)}>
      <rect x={3} y={7 + lift * .15} width={145} height={81} rx={13} fill="#83946d" opacity={.19} />
      <rect width={145} height={81} rx={13} fill="#fffdf5" stroke="#bdccb0" />
      <Text x={13} y={24} size={11} fill="#a0aa90" mono>#DD-042</Text><Text x={13} y={47} size={17}>Yeni sipariş</Text>
      <rect x={13} y={57} width={79} height={14} rx={7} fill={phase === 2 ? '#deedc9' : '#eae8d6'} /><Text x={52} y={68} size={9} anchor="middle" fill="#8b986f">{phase === 2 ? 'tamamlandı' : phase === 1 ? 'hazırlanıyor' : 'sırada'}</Text>
      <circle cx={119} cy={64} r={10} fill={phase === 2 ? '#cce3ae' : '#e6d9c5'} />{phase === 2 ? <Check x={119} y={64} size={12} /> : <Text x={119} y={68} size={10} anchor="middle" fill="#9d8d70">D</Text>}
    </g>
    <g opacity={enter(f, 152)}><circle cx={516} cy={246} r={22} fill="#c7dfaa" /><Check x={516} y={246} size={22} /><circle cx={516} cy={246} r={24 + progress(f, 153, 181) * 19} fill="none" stroke="#b0cc90" opacity={1 - progress(f, 153, 181)} /></g>
    <Text x={320} y={340} size={15} anchor="middle" fill="#8a9d78">{f > 150 ? 'Daha az takip. Daha çok akış.' : 'Talep geldi → hazırlanıyor → tamamlandı'}</Text>
  </Scene>;
}
