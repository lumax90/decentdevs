import { AbsoluteFill } from 'remotion';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, Eye, GitBranch, LockKeyhole, MousePointer2, ShieldCheck, Sparkles, WifiOff, X } from 'lucide-react';
import { BrandMark } from '../../src/components/brand';
import { AppointmentCard, BadCalendar, CalendarUI, CheckBadge, Cursor, NodeBox, Wire } from './ui';
import { C, Camera, Eyebrow, Headline, mix, phase, Pop, useShot } from './shared';

export function Start() {
  const { p, f, fps } = useShot();
  const build = phase(p, .27, .60), carry = phase(p, .80, .98);
  const prompt = 'Bir randevu uygulaması yap.';
  const text = prompt.slice(0, Math.floor(mix(0, prompt.length, phase(p, .08, .36))));
  return <AbsoluteFill style={{ background: C.paper }}>
    <Camera zoom={mix(1, 1.025, phase(p, .55, .9))}>
      <div className="intro-wordmark" style={{ position: 'absolute', left: 118, top: 89 }}><BrandMark />decent<span style={{ fontWeight: 400, marginLeft: -13 }}>devs.</span></div>
      <div style={{ position: 'absolute', left: 115, top: 270, transform: `translateX(${-90 * carry}px)`, opacity: 1 - carry }}>
        <Eyebrow style={{ color: '#8b8f80', marginBottom: 31 }}>ARTIK BİR FİKİR YETER.</Eyebrow>
        <Headline style={{ fontSize: 124 }}>Bir komut.<br /><span style={{ color: '#7f9362', display: 'inline-block', clipPath: `inset(-15px ${(1 - build) * 100}% -40px 0)` }}>Bir uygulama.</span></Headline>
        <div style={{ marginTop: 40, color: '#818775', fontSize: 28, opacity: phase(p, .08, .18) }}>Başlamak hiç bu kadar kolay olmamıştı.</div>
      </div>
      <div style={{ position: 'absolute', left: 921, top: mix(360, 190, build), width: 802, height: mix(150, 718, build), transform: `rotate(${mix(4, -3, build)}deg) translateY(${-20 * carry}px)`, opacity: 1 - carry * .86 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 25, background: C.white, border: '1px solid #dedfcf', boxShadow: '0 30px 75px #25251c20', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, height: 130, padding: '0 34px', borderBottom: '1px solid #e2e4d7' }}><Sparkles color="#819261" size={30} /><span style={{ fontSize: 28, flex: 1, letterSpacing: -1 }}>{text}<span style={{ opacity: f % fps < fps / 2 ? 1 : .25 }}>│</span></span><span style={{ width: 50, height: 50, borderRadius: 15, display: 'grid', placeItems: 'center', color: '#456029', background: C.lime, transform: `scale(${1 - .12 * Math.sin(phase(p, .31, .36) * Math.PI)})` }}><ArrowUpRight size={27} /></span></div>
          <div style={{ position: 'absolute', left: 23, top: 150, right: 23, bottom: 23, transform: `translateY(${(1 - build) * 90}px)`, opacity: build }}><CalendarUI compact /></div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: mix(1200, 760, carry), top: mix(705, 412, carry), transform: `rotate(${mix(7, 0, carry)}deg) scale(${mix(.87, 1.08, carry)})`, transformOrigin: 'center', opacity: phase(p, .43, .57) }}><AppointmentCard /></div>
      <div style={{ position: 'absolute', left: 117, bottom: 156, fontSize: 21, color: '#8c9480', opacity: 1 - carry }}>İyi bir başlangıç. <span style={{ color: '#4f6140' }}>Peki ya sonrası?</span></div>
    </Camera>
  </AbsoluteFill>;
}

export function Reality() {
  const { p } = useShot();
  const split = phase(p, .06, .27), collision = phase(p, .29, .42), loose = phase(p, .49, .62), exit = phase(p, .85, .98);
  return <AbsoluteFill style={{ background: C.dark, color: C.paper }}>
    <Camera zoom={mix(1, 1.035, phase(p, .35, .85))}>
      <div style={{ position: 'absolute', left: 110, top: 102, opacity: phase(p, .02, .10) * (1 - exit) }}><Eyebrow style={{ color: '#9fa891', marginBottom: 23 }}>DEMO GÜZEL. GERÇEK HAYAT BİRAZ KARIŞIK.</Eyebrow><Headline style={{ fontSize: 101 }}>Aynı anda.<br /><span style={{ color: C.coral }}>Aynı saat.</span></Headline></div>
      <div style={{ position: 'absolute', right: 135, top: 94, fontSize: 260, fontWeight: 650, letterSpacing: -20, color: '#30382c', lineHeight: 1, opacity: split * (1 - exit) }}>02<span style={{ fontSize: 57, letterSpacing: -2, color: '#79886b' }}> istek</span></div>
      {[0, 1].map(i => <div key={i} style={{ position: 'absolute', left: mix(760, i ? 1043 : 474, split) + (i ? 1 : -1) * Math.sin(collision * Math.PI) * 13, top: 432 + (i ? 13 : -13) * split, transform: `rotate(${(i ? 5 : -5) * split}deg) scale(${mix(1.08, 1, split)})`, opacity: (i ? split : 1) * (1 - exit) }}><div style={{ color: '#aab69b', fontSize: 17, marginBottom: 17, paddingLeft: 10, display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, background: '#3b4932', borderRadius: '50%', color: C.lime }}>{i ? 'B' : 'A'}</span>{i ? 'İkinci kullanıcı' : 'İlk kullanıcı'}</div><AppointmentCard status={collision > .1 ? 'Onaylandı?' : 'İstek gönderildi'} color={collision > .1 ? '#e2bba8' : C.lavender} /><div style={{ marginTop: 20, paddingLeft: 8, color: C.red, fontSize: 22, opacity: collision }}>İki onay. Tek boş saat.</div></div>)}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 1 - exit }}><Wire path="M675 706 C675 786 960 721 960 808 C960 721 1250 786 1250 706" progress={collision} color={C.red} width={3} /></svg>
      <div style={{ position: 'absolute', left: 727, top: 775, display: 'flex', alignItems: 'center', gap: 14, fontSize: 25, color: '#f1c7b8', background: '#543831', border: '1px solid #a16654', borderRadius: 17, padding: '17px 25px', opacity: collision * (1 - loose) }}><X size={24} />Çakışmayı kim çözecek?</div>
      <div style={{ position: 'absolute', left: 155, top: 755, display: 'flex', alignItems: 'center', gap: 15, color: '#dfd5c7', border: '1px solid #736959', borderRadius: 16, padding: '20px 26px', background: '#323229', transform: `translateX(${(1 - loose) * -80}px) rotate(-3deg)`, opacity: loose * (1 - exit) }}><WifiOff size={27} /><span style={{ fontSize: 25 }}>Bağlantı kesildi.</span></div>
      <div style={{ position: 'absolute', right: 132, top: 768, display: 'flex', alignItems: 'center', gap: 15, color: '#d7c5ef', border: '1px solid #796a8d', borderRadius: 16, padding: '20px 26px', background: '#38313f', transform: `translateX(${(1 - phase(p, .64, .73)) * 70}px) rotate(3deg)`, opacity: phase(p, .64, .73) * (1 - exit) }}><LockKeyhole size={27} /><span style={{ fontSize: 25 }}>Bu veriyi kim görebilir?</span></div>
      <div style={{ position: 'absolute', left: mix(474, 318, exit), top: mix(432, 474, exit), transform: `rotate(${mix(-5, -2, exit)}deg)`, opacity: exit }}><AppointmentCard status="Bir daha düşünelim" /></div>
    </Camera>
  </AbsoluteFill>;
}

export function Design() {
  const { p } = useShot();
  const reveal = phase(p, .12, .37), focus = phase(p, .58, .76), carry = phase(p, .84, .99);
  return <AbsoluteFill style={{ background: C.paper }}>
    <div style={{ position: 'absolute', left: 117, top: 83, opacity: 1 - carry }}><Eyebrow style={{ color: '#78816e', marginBottom: 19 }}>AYNI FİKİR. İKİ FARKLI YAKLAŞIM.</Eyebrow><Headline style={{ fontSize: 96 }}>Gözün, farkı hisseder.</Headline></div>
    <Camera zoom={mix(1, 1.055, focus)} x={-29 * focus}>
      <div style={{ position: 'absolute', left: 118, top: 321, width: 797, height: 596, opacity: 1 - focus * .37 - carry * .63, transform: `translateX(${-80 * carry}px) rotate(-1deg)` }}><div style={{ fontSize: 16, color: '#887599', marginBottom: 17, letterSpacing: 1.6 }}>HAM ÇIKTI</div><div style={{ height: 552 }}><BadCalendar pulse={Math.sin(p * Math.PI * 8)} /></div></div>
      <div style={{ position: 'absolute', left: 1004, top: 321, width: 797, height: 596, transform: `translateX(${(1 - reveal) * 76}px) rotate(${mix(2, 0, focus)}deg)`, clipPath: reveal > .999 ? 'none' : `inset(0 0 0 ${(1 - reveal) * 100}%)`, opacity: 1 - carry }}><div style={{ fontSize: 16, color: '#586e42', marginBottom: 17, letterSpacing: 1.6 }}>AI + TASARIM GÖZÜ</div><div style={{ height: 552 }}><CalendarUI compact emphasis={phase(p, .47, .62) * (1 - phase(p, .72, .79))} /></div></div>
      <div style={{ position: 'absolute', left: 948, top: 343, width: 2, height: 542, background: '#b5bca8', transform: `scaleY(${reveal})`, transformOrigin: 'top' }} />
      <Cursor x={mix(1718, 1540, phase(p, .40, .56))} y={mix(543, 720, phase(p, .40, .56))} label="neyin önemli olduğu belli." scale={.8} />
    </Camera>
    <div style={{ position: 'absolute', left: 129, top: 252, display: 'flex', gap: 34, color: '#68785a', fontSize: 19, opacity: phase(p, .38, .52) * (1 - carry) }}><span>Hiyerarşi</span><span>Okunabilirlik</span><span>Tutarlı akış</span><span>Doğru eylem ↗</span></div>
    <div style={{ position: 'absolute', left: mix(1195, 738, carry), top: mix(562, 380, carry), transform: `perspective(1200px) rotateY(${carry * -68}deg) scale(${mix(.7, 1.4, carry)})`, opacity: carry }}><AppointmentCard status="İyi düşünülmüş" color={C.lime} /></div>
    <div style={{ position: 'absolute', right: 128, top: 274, fontSize: 12, color: '#8d9482', opacity: 1 - carry }}>Film için hazırlanmış temsili arayüzler.</div>
  </AbsoluteFill>;
}

export function Architecture() {
  const { p } = useShot();
  const organize = phase(p, .10, .32), packet = phase(p, .32, .53), second = phase(p, .59, .67), exit = phase(p, .91, .995);
  const x = [209, 618, 1027, 1436];
  const specs = [
    { kind: 'input' as const, title: 'İstek', description: 'Kim, ne yapmak istiyor?' },
    { kind: 'auth' as const, title: 'Yetki', description: 'Bu işlem ona açık mı?' },
    { kind: 'logic' as const, title: 'İş kuralı', description: 'Bu saat gerçekten boş mu?' },
    { kind: 'data' as const, title: 'Veri', description: 'Tek, tutarlı bir kayıt.' },
  ];
  return <AbsoluteFill style={{ background: '#1b211b', color: '#f3f0e9' }}>
    <div style={{ position: 'absolute', left: 116, top: 103, opacity: 1 - exit }}><Eyebrow style={{ color: '#a7b498', marginBottom: 20 }}>EKRANIN ARKASINDA DA BİR TASARIM VAR.</Eyebrow><Headline style={{ fontSize: 101 }}>Görünmeyen özen.</Headline></div>
    <Camera zoom={mix(1, 1.045, packet)} x={-35 * packet}>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: 1 - exit }}>
        {['M359 481C913 135 790 925 1580 462', 'M359 575C1159 969 812 251 1159 574', 'M771 566C999 755 1275 285 1578 506'].map((d, i) => <path key={d} d={d} fill="none" stroke={i === 1 ? '#a77a66' : '#7f7690'} strokeWidth="2" strokeDasharray="8 9" opacity={(1 - organize) * .7} />)}
        {[0, 1, 2].map(i => <g key={i}><path d={`M${x[i] + 284} 509H${x[i + 1]}`} stroke="#485640" strokeWidth="3" /><Wire path={`M${x[i] + 284} 509H${x[i + 1]}`} progress={phase(p, .34 + i * .05, .40 + i * .05)} color={C.lime} width={4} /></g>)}
        <Wire path="M1580 654V739H1100" progress={phase(p, .52, .60)} color={C.lime} width={3} />
        <Wire path="M1170 654V818H1100" progress={second} color={C.coral} width={3} />
      </svg>
      {specs.map((spec, i) => <div key={spec.title} style={{ position: 'absolute', left: mix(x[i] + [40, -95, 60, -40][i], x[i], organize), top: mix(423 + [80, -80, 65, -65][i], 412, organize), width: 284, transform: `rotate(${(1 - organize) * [8, -7, 6, -8][i]}deg) translateY(${-60 * exit}px)`, opacity: 1 - exit }}><NodeBox {...spec} active={p > .36 + i * .045} /></div>)}
      <div style={{ position: 'absolute', left: 527, top: 707, width: 573, height: 64, display: 'flex', gap: 15, alignItems: 'center', padding: '16px 25px', background: '#33452b', border: '1px solid #748f52', borderRadius: 14, color: C.lime, fontSize: 24, opacity: phase(p, .52, .60) * (1 - exit) }}><Check size={26} />İlk istek: randevu onaylandı.</div>
      <div style={{ position: 'absolute', left: 527, top: 786, width: 573, height: 64, display: 'flex', gap: 15, alignItems: 'center', padding: '16px 25px', background: '#443a2f', border: '1px solid #977857', borderRadius: 14, color: '#eac9a3', fontSize: 24, opacity: second * (1 - exit) }}><ArrowRight size={25} />İkinci istek: başka bir saat seçelim.</div>
      <div style={{ position: 'absolute', left: 217, top: 719, fontSize: 19, lineHeight: 1.8, color: '#9cac8d', opacity: packet * (1 - exit) }}>Aynı anda.<br /><span style={{ color: '#dee9d3' }}>Tutarlı sonuç.</span></div>
    </Camera>
    <div style={{ position: 'absolute', right: 156, top: 270, fontSize: 18, color: '#93a685', transform: 'rotate(4deg)', opacity: organize * (1 - exit) }}>Güzel çalışması tesadüf değil.</div>
    <div style={{ position: 'absolute', left: 739, top: 383, opacity: exit, transform: `scale(${mix(.6, 1.1, exit)})` }}><AppointmentCard status="Kontroller tamam" color={C.lime} /></div>
  </AbsoluteFill>;
}

export function Craft() {
  const { p, fps } = useShot();
  const review = phase(p, .30, .49), fix = phase(p, .52, .70), done = phase(p, .71, .84), carry = phase(p, .88, .99);
  return <AbsoluteFill style={{ background: '#e2d9ed' }}>
    <Camera x={mix(0, -13, review)} zoom={mix(1, 1.015, done)}>
      <div style={{ position: 'absolute', left: 114, top: 134, opacity: 1 - carry }}><Eyebrow style={{ color: '#8b759d', marginBottom: 29 }}>İŞTE BİZİM DEVREYE GİRDİĞİMİZ YER.</Eyebrow><Headline style={{ fontSize: 118 }}>Hız.<br /><span style={{ color: '#78658d' }}>Muhakeme.</span><br />Özen.</Headline><div style={{ marginTop: 37, maxWidth: 560, color: '#796588', fontSize: 28, lineHeight: 1.6 }}>Tecrübe, tasarım gözü ve AI.<br /><span style={{ color: '#40314c' }}>Birlikte daha iyi.</span></div></div>
      <div style={{ position: 'absolute', left: 855, top: 213, width: 935, height: 581, borderRadius: 25, background: '#24202b', boxShadow: '0 25px 65px #4b315827', overflow: 'hidden', transform: `rotate(${mix(3, 0, review)}deg) translateY(${-45 * carry}px)`, opacity: 1 - carry }}>
        <div style={{ display: 'flex', gap: 33, alignItems: 'center', padding: '25px 35px', borderBottom: '1px solid #51435e', fontSize: 19, color: '#aa97bb' }}><span style={{ color: review < .2 ? '#f5ecfb' : undefined }}>İhtiyaç</span><span>Tasarım</span><span style={{ color: review > .2 ? C.lime : undefined }}>Kod</span><span style={{ marginLeft: 'auto', fontSize: 13 }}>reserve.ts</span></div>
        <div style={{ position: 'absolute', left: 41, right: 41, top: 120, opacity: 1 - review }}><div style={{ color: '#baa7cc', fontSize: 15, marginBottom: 29 }}>ÖNCE DOĞRU SORU</div><div style={{ color: '#f3e9fd', fontSize: 35, letterSpacing: -1, lineHeight: 1.55 }}>“Aynı saati iki kişi seçtiğinde<br />ne olmasını istiyoruz?”</div><div style={{ marginTop: 39, display: 'flex', gap: 13, color: '#cdbee0', fontSize: 18 }}><span style={{ background: '#393141', padding: '13px 17px', borderRadius: 10 }}>Tek kayıt</span><span style={{ background: '#393141', padding: '13px 17px', borderRadius: 10 }}>Anlaşılır geri bildirim</span></div></div>
        <div style={{ position: 'absolute', left: 35, right: 35, top: 120, opacity: review, fontFamily: 'Consolas, monospace', fontSize: 27, lineHeight: 1.75, letterSpacing: -.8 }}><div style={{ color: '#bcb0c7' }}><span style={{ color: '#b791dc' }}>async function</span> reserve(slot) {'{'}</div><div style={{ paddingLeft: 24, color: '#c7b7d3' }}>const user = session.user;</div><div style={{ marginTop: 16, position: 'relative', overflow: 'hidden', height: 68 }}><div style={{ position: 'absolute', inset: 0, color: '#dc9c93', background: '#68404466', borderLeft: '3px solid #b5746d', padding: '9px 22px', transform: `translateY(${-70 * fix}px)`, textDecoration: fix ? 'line-through' : undefined }}>return db.insert(slot);</div><div style={{ position: 'absolute', inset: 0, color: '#d8eeaa', background: '#4d603366', borderLeft: '3px solid #9ab873', padding: '9px 22px', transform: `translateY(${70 * (1 - fix)}px)` }}>return transaction(() =&gt; {'{'}</div></div><div style={{ color: '#d1e8a9', paddingLeft: 44, opacity: fix }}>checkPermission(user);<br />reserveOnce(slot, user);</div><div style={{ color: '#bcb0c7', opacity: fix, paddingLeft: 23 }}>{'});'}</div><div style={{ color: '#bcb0c7' }}>{'}'}</div></div>
        <div style={{ position: 'absolute', left: 35, right: 35, bottom: 22, display: 'flex', justifyContent: 'space-between', color: '#9987a9', fontSize: 14 }}><span>Bağlam → inceleme → düzeltme</span><span style={{ color: '#bfd6a0', opacity: done }}>✓ Kontrol edildi</span></div>
      </div>
      <Cursor x={mix(1680, 1390, phase(p, .40, .63))} y={mix(364, 486, phase(p, .40, .63))} color="#725487" label="bir insan dokunuşu." scale={.9} />
      <Pop delay={Math.floor(fps * .5)} style={{ position: 'absolute', left: 839, top: 770, opacity: done * (1 - carry), transform: 'rotate(-3deg)' }}><CheckBadge>Kritik akışlar, gerçekten test edildi.</CheckBadge></Pop>
      <div style={{ position: 'absolute', left: mix(1135, 760, carry), top: mix(388, 410, carry), opacity: carry, transform: `scale(${mix(.8, 1.12, carry)})` }}><AppointmentCard status="Yayına hazırlanıyor" color={C.lime} /></div>
    </Camera>
  </AbsoluteFill>;
}

export function Delivery() {
  const { p } = useShot();
  const spread = phase(p, .05, .27), settle = phase(p, .35, .72), final = phase(p, .85, .99);
  return <AbsoluteFill style={{ background: '#eef0e6' }}>
    <div style={{ position: 'absolute', left: 117, top: 93, opacity: 1 - final }}><Eyebrow style={{ color: '#879174', marginBottom: 19 }}>İYİ BİR BAŞLANGIÇ, İYİ BİR ÜRÜNE DÖNÜŞSÜN.</Eyebrow><Headline style={{ fontSize: 102 }}>Fikirden, gerçek hayata.</Headline></div>
    <Camera zoom={mix(.94, 1.005, spread)} y={mix(22, 0, spread)}>
      <div style={{ position: 'absolute', width: 972, height: 544, left: mix(710, 486, spread), top: 310, transform: `rotate(${mix(0, -3, spread)}deg) translateY(${-28 * final}px)`, opacity: spread * (1 - final) }}><CalendarUI booked={settle > .6} /></div>
      <div style={{ position: 'absolute', width: 284, height: 543, left: mix(810, 134, spread), top: 350, transform: `rotate(${-7 * spread}deg) translateY(${-17 * final}px)`, opacity: spread * (1 - final), filter: 'drop-shadow(0 18px 18px #42552a1f)' }}><CalendarUI phone booked={settle > .6} /></div>
      <div style={{ position: 'absolute', left: mix(960, 1515, spread), top: 392, width: 299, padding: 29, borderRadius: 22, background: '#d8e5c5', color: '#465a35', boxShadow: '0 23px 45px #32412413', transform: `rotate(${6 * spread}deg)`, opacity: spread * (1 - final) }}><div style={{ fontSize: 20, marginBottom: 30 }}>Her şey yerli yerinde.</div>{['Doğru kapsam', 'Tutarlı tasarım', 'Test edilen akışlar', 'Yayın & devir'].map((label, i) => <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBlock: 17, borderTop: '1px solid #afc198', fontSize: 16 }}><Check size={19} style={{ opacity: phase(p, .31 + i * .10, .39 + i * .10) }} />{label}</div>)}</div>
      <div style={{ position: 'absolute', left: 760, top: 410, transform: `scale(${mix(1.12, .55, spread)})`, opacity: 1 - spread }}><AppointmentCard status="Yayına hazırlanıyor" color={C.lime} /></div>
    </Camera>
    <div style={{ position: 'absolute', left: 465, right: 380, bottom: 132, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, color: '#697a56', fontSize: 19, opacity: phase(p, .38, .50) * (1 - final) }}>{['React', 'Vue', 'Nuxt', 'Rust', 'iOS native', 'Android native'].map(text => <span key={text}>{text}</span>)}</div>
    <div style={{ position: 'absolute', left: mix(760, 1218, final), top: mix(410, 280, final), width: 440, height: 440, opacity: final, transform: `rotate(${mix(0, 9, final)}deg) scale(${mix(.5, 1, final)})`, color: '#d0dfb4', '--mark-ink': '#778f54' } as React.CSSProperties}><BrandMark /></div>
  </AbsoluteFill>;
}

export function Signature() {
  const { p } = useShot();
  return <AbsoluteFill style={{ background: C.paper }}>
    <div style={{ position: 'absolute', left: 108, top: 142, paddingBottom: 60, clipPath: `inset(0 0 ${(1 - phase(p, .02, .24)) * 100}% 0)` }}><Headline style={{ fontSize: 230, letterSpacing: -12, lineHeight: .96 }}>Good<br />enough<span style={{ color: '#94ad6d' }}>.</span></Headline></div>
    <div style={{ position: 'absolute', left: 1218, top: 280, width: 440, height: 440, transform: `rotate(${mix(9, -5, phase(p, .06, .55))}deg) translateY(${Math.sin(p * Math.PI) * -13}px)`, color: '#d0dfb4', '--mark-ink': '#778f54', filter: 'drop-shadow(20px 25px 0 #becfa330)' } as React.CSSProperties}><BrandMark /></div>
    <div className="intro-wordmark" style={{ position: 'absolute', left: 121, top: 806, opacity: phase(p, .20, .36) }}><BrandMark />decent<span style={{ fontWeight: 400, marginLeft: -12 }}>devs.</span></div>
    <div style={{ position: 'absolute', left: 1218, top: 805, opacity: phase(p, .35, .52) }}><div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 29, fontWeight: 550, color: '#4d603d' }}>Bir şey yapalım. <ArrowUpRight size={30} /></div><div style={{ color: '#859172', fontSize: 24, marginTop: 19 }}>decentdevs.com</div></div>
  </AbsoluteFill>;
}
