import { ArrowRight, Check, CalendarDays, LockKeyhole, CircleCheck, Layers, Database, ShieldCheck, UserRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import { C, clamp } from './shared';

export function Cursor({ x, y, label = 'decent', color = '#344a29', scale = 1 }: { x: number; y: number; label?: string; color?: string; scale?: number }) {
  return <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${scale})`, transformOrigin: 'top left', zIndex: 8 }}><svg width="39" height="48" viewBox="0 0 39 48"><path d="M4 3L34 26 22 29 17 42Z" fill={color} stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" /></svg>{label && <div style={{ background: color, color: 'white', borderRadius: 20, padding: '7px 13px', fontSize: 16, marginLeft: 25, marginTop: -8, width: 'max-content' }}>{label}</div>}</div>;
}

export function AppointmentCard({ time = '15:30', status = 'Seçilen saat', name = 'Tasarım görüşmesi', color = C.lavender, style = {} }: { time?: string; status?: string; name?: string; color?: string; style?: CSSProperties }) {
  return <div className="appointment-card" style={{ background: color, ...style }}><div className="card-header"><span>mola.</span><span className="card-status">{status}</span></div><div className="card-time"><span className="mini-calendar">09</span><span>{time}</span><CalendarDays size={28} style={{ marginLeft: 'auto', opacity: .65 }} /></div><div className="card-bottom"><span>{name}</span><span>30 dk ↗</span></div></div>;
}

export function CalendarUI({ compact = false, phone = false, selectedTime = '15:30', booked = false, emphasis = 0 }: { compact?: boolean; phone?: boolean; selectedTime?: string; booked?: boolean; emphasis?: number }) {
  return <div className={`calendar-ui ${compact || phone ? 'compact' : ''} ${phone ? 'phone' : ''}`}>
    <div className="calendar-nav"><span className="mola-logo"><i /> mola.</span><span style={{ fontSize: phone ? 10 : 13, color: '#849476' }}>{phone ? '9:41' : 'Günün, biraz daha düzenli.'}</span></div>
    <div className="calendar-body">{!compact && !phone && <aside className="calendar-sidebar"><div className="selected">Takvim</div><div>Randevular</div><div>Müşteriler</div><div style={{ marginTop: 100, fontSize: 12 }}>Kişisel çalışma alanı</div></aside>}
      <div className="calendar-main"><h3>Biraz zaman ayıralım.</h3><div className="calendar-sub">Sana uyan bir saat seç.</div><div className="calendar-days">{['Pzt', 'Sal', 'Çar', 'Per', 'Cum'].map((d, i) => <div className={`calendar-day ${i === 2 ? 'active' : ''}`} key={d}><small>{d}</small>{i + 7}</div>)}</div><div className="calendar-slots">{(phone ? ['13:00', selectedTime] : ['10:00', '13:00', selectedTime, '16:30']).map((t, i) => <div key={`${t}-${i}`} className={`calendar-slot ${t === selectedTime ? 'active' : ''}`}>{t}</div>)}</div>
        <div className="calendar-action" style={{ boxShadow: `0 0 0 ${emphasis * 8}px #d7ee9c60` }}><span>{booked ? 'Randevun hazır' : 'Randevuyu onayla'}</span>{booked ? <Check size={22} /> : <ArrowRight size={22} />}</div><div className="calendar-footer">{booked ? '9 Kasım · Onay bilgisi e-postana iletildi.' : 'Tasarım görüşmesi · 30 dakika'}</div>
      </div>
    </div>
  </div>;
}

export function BadCalendar({ pulse = 0 }: { pulse?: number }) {
  return <div className="bad-calendar"><div className="bad-nav"><b>✦ MOLA.AI</b><span style={{ fontSize: 13 }}>Ana sayfa · Özellikler · Daha fazla</span></div><div className="bad-banner"><div className="bad-title">Randevunun<br /><span className="bad-gradient">geleceğine hoş geldin!</span></div><div style={{ fontSize: 13, opacity: .65, marginTop: 13 }}>Daha yenilikçi. Daha akıllı. Daha fazlası.</div><div className="bad-actions"><span>Hemen başla →</span><span style={{ background: '#e797fc' }}>Keşfet ✦</span><span style={{ background: '#96e4ff' }}>Devam et →</span></div></div><div className="bad-tiles">{['Takvim', 'Takvimim', 'Randevular', 'Genel bakış', 'Bugün', 'Başlangıç'].map((label, i) => <div className="bad-tile" key={label} style={{ transform: `translateY(${i % 2 ? 9 : 0}px)`, borderRadius: [8, 25, 4, 22, 5, 15][i] }}><span style={{ opacity: .68 }}>{label}</span><b style={{ color: ['#fff', '#d8a7ff', '#9fdcff'][i % 3] }}>{i % 2 ? '15:30' : '09 Kasım'}</b></div>)}</div><div style={{ position: 'absolute', right: 16, bottom: 17, background: '#ef8bfb', padding: '12px 17px', borderRadius: 50, fontSize: 13, color: '#45135e', transform: `scale(${1 + pulse * .025})` }}>✦ Nasıl yardımcı olabilirim?</div></div>;
}

export function Wire({ path, progress, color = C.lime, width = 3, dashed = false }: { path: string; progress: number; color?: string; width?: number; dashed?: boolean }) {
  return <path d={path} pathLength={1} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={dashed ? '.025 .018' : 1} strokeDashoffset={dashed ? -progress * .2 : 1 - clamp(progress)} opacity={dashed ? .6 : 1} />;
}

const nodeIcons = { input: UserRound, auth: ShieldCheck, logic: Layers, data: Database, lock: LockKeyhole, done: CircleCheck };
export function NodeBox({ kind, title, description, style = {}, active = false }: { kind: keyof typeof nodeIcons; title: string; description: string; style?: CSSProperties; active?: boolean }) {
  const Icon = nodeIcons[kind];
  return <div className="node-box" style={{ ...style, ...(active ? { background: '#d7ee9c', color: '#344828', borderColor: '#ecf6d6' } : {}) }}><span className="node-icon"><Icon size={25} /></span><strong>{title}</strong><small style={active ? { color: '#5f734a' } : {}}>{description}</small></div>;
}

export function CheckBadge({ children, style = {} }: { children: React.ReactNode; style?: CSSProperties }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 20px', borderRadius: 15, background: '#d7ee9c', color: '#3c542c', fontSize: 20, boxShadow: '0 10px 30px #0001', ...style }}><CircleCheck size={24} />{children}</div>;
}
