'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, CheckCheck, Circle, Command, LayoutGrid, ListTodo, MoreHorizontal, Pause, Play, Plus, Power, RotateCcw, Sparkles, Sun } from 'lucide-react';

const initialTasks = [
  { id: 'a', title: 'Güzel bir fikir bul', tag: 'Fikir', done: true },
  { id: 'b', title: 'İlk ekranı tasarla', tag: 'Tasarım', done: true },
  { id: 'c', title: 'Küçük detayları düşün', tag: 'Tasarım', done: false },
  { id: 'd', title: 'Çalışan hâlini gör', tag: 'Geliştirme', done: false },
];

export function OrbitDemo({ expanded = false }: { expanded?: boolean }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState('');
  const completed = tasks.filter(t => t.done).length;
  const visible = tasks.filter(t => filter === 'all' || (filter === 'todo' ? !t.done : t.done));
  return <div className={`orbit-app ${expanded ? 'expanded' : ''}`}>
    <aside className="orbit-sidebar" aria-label="Orbit görünümü">
      <div className="orbit-logo"><span className="orbit-logo-symbol">o</span><strong>orbit</strong></div>
      <span className="app-workspace-label">KİŞİSEL ALAN</span>
      <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}><LayoutGrid size={15} /> Genel bakış</button>
      <button type="button" className={filter === 'todo' ? 'active' : ''} onClick={() => setFilter('todo')}><ListTodo size={15} /> Yapılacaklar <span>{tasks.length - completed}</span></button>
      <button type="button" className={filter === 'done' ? 'active' : ''} onClick={() => setFilter('done')}><CheckCheck size={15} /> Tamamlanan</button>
      <div className="orbit-sidebar-note"><Sparkles size={19} /><span>Küçük adımlar.<br />Güzel şeyler.</span></div>
      <div className="orbit-profile"><span>d.</span><div>Benim alanım<small>İyi bir gün olsun.</small></div></div>
    </aside>
    <div className="orbit-content">
      <div className="orbit-toolbar"><span>Çalışma alanı <span>/</span> Genel bakış</span><span className="app-live"><i /> Her şey güncel</span></div>
      <div className="orbit-greeting"><div><span className="orbit-date"><Sun size={12} /> YENİ BİR GÜN</span><h3>Bir şeyler üretelim<span>.</span></h3><p>Acele etmeden. Birer birer.</p></div><span className="orbit-sparkle" aria-hidden="true">✳</span></div>
      <div className="orbit-stats"><div><span>Bugünün işleri</span><strong>{String(tasks.length).padStart(2, '0')} <ListTodo size={17} /></strong></div><div><span>Tamamlanan</span><strong>{String(completed).padStart(2, '0')} <CheckCheck size={17} /></strong></div><div className="orbit-progress-stat"><span>İyi gidiyoruz</span><strong>{Math.round(completed / tasks.length * 100)}<small>%</small></strong><div className="app-progress"><i style={{ width: `${completed / tasks.length * 100}%` }} /></div></div></div>
      <div className="orbit-task-heading"><h4>Bir sonraki küçük adım</h4><span><MoreHorizontal size={19} /></span></div>
      <div className="orbit-tasks" aria-label="Görevler">
        {visible.length === 0 && <p className="orbit-empty">Burada her şey tamam. Güzel iş!</p>}
        {visible.map(task => <label key={task.id} className={`orbit-task ${task.done ? 'done' : ''}`}>
          <input type="checkbox" checked={task.done} onChange={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t))} aria-label={`${task.title} görevini ${task.done ? 'yeniden aç' : 'tamamla'}`} />
          <span className="task-checkbox">{task.done && <Check size={10} strokeWidth={3} />}</span><span className="task-title">{task.title}</span><span className={`task-tag tag-${task.tag === 'Tasarım' ? 'design' : task.tag === 'Fikir' ? 'idea' : 'dev'}`}>{task.tag}</span>
        </label>)}
      </div>
      <form className="orbit-add" onSubmit={e => { e.preventDefault(); if (newTask.trim() && tasks.length < 12) { setTasks(ts => [...ts, { id: crypto.randomUUID(), title: newTask.trim(), tag: 'Fikir', done: false }]); setNewTask(''); setFilter('all'); } }}>
        <Plus size={14} /><input aria-label="Yeni görev" placeholder={tasks.length >= 12 ? 'Biraz da bunları bitirelim :)' : 'Aklına bir şey mi geldi?'} value={newTask} maxLength={60} disabled={tasks.length >= 12} onChange={e => setNewTask(e.target.value)} /><button type="submit" disabled={!newTask.trim() || tasks.length >= 12} aria-label="Görev ekle">↵</button>
      </form>
      <div className="orbit-bottom"><span><Command size={11} /> Biraz düzen iyi gelir.</span><span>Konsept çalışma</span></div>
    </div>
  </div>;
}

export function SakinDemo() {
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const deadline = useRef(0);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) setRunning(false);
    };
    const interval = window.setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, [running]);
  function toggle() {
    if (running) { setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))); setRunning(false); }
    else { const seconds = remaining || minutes * 60; deadline.current = Date.now() + seconds * 1000; setRemaining(seconds); setRunning(true); }
  }
  const time = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  return <div className="sakin-app">
    <div className="phone-status"><span>9:41</span><span className="phone-island" /><span className="phone-bars">▰</span></div>
    <div className="sakin-top"><strong>sakin<span>✳</span></strong><span>kendine bir alan.</span></div>
    <div className="sakin-mood"><span className={`little-sun ${running ? 'breathing' : ''}`} aria-hidden="true"><i /><i /><b /></span><p>{remaining === 0 ? 'Güzel iş. Bir mola?' : running ? 'Dünya biraz bekleyebilir.' : 'Şimdi, sadece bir şey.'}</p></div>
    <div className="focus-clock"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="72" className="clock-track" /><circle cx="80" cy="80" r="72" className="clock-fill" strokeDasharray={452.39} strokeDashoffset={452.39 * (1 - remaining / (minutes * 60))} /></svg><div><span role="timer" aria-live="off" aria-label={`Kalan süre ${time}`}>{time}</span><small>{running ? 'akıştasın' : remaining === 0 ? 'tamamlandı' : 'odak zamanı'}</small></div></div>
    <div className="focus-durations" aria-label="Odak süresi">{[15, 25, 45].map(m => <button type="button" key={m} aria-pressed={minutes === m} onClick={() => { setMinutes(m); setRemaining(m * 60); setRunning(false); }}>{m} dk</button>)}</div>
    <div className="focus-controls"><button type="button" className="focus-start" onClick={toggle}>{running ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}{running ? 'Bir nefes al' : remaining === 0 ? 'Yeniden başla' : 'Odaklanalım'}</button><button type="button" className="focus-reset" aria-label="Zamanlayıcıyı sıfırla" onClick={() => { setRemaining(minutes * 60); setRunning(false); }}><RotateCcw size={15} /></button></div>
    <div className="sakin-bottom"><span className="tiny-dot" /> Küçük bir mobil konsept.</div><div className="phone-home" />
  </div>;
}

export const lampColors = { peach: { name: 'Kayısı', main: '#f1a882', light: '#ffe0c7', dark: '#bd7257' }, lavender: { name: 'Leylak', main: '#b6a0e8', light: '#e6dcff', dark: '#8270ae' }, mint: { name: 'Adaçayı', main: '#a8bb96', light: '#dce7c9', dark: '#758866' } };
export type LampColor = keyof typeof lampColors;

export function LampArt({ color = 'peach', lit = true }: { color?: LampColor; lit?: boolean }) {
  const id = useId().replace(/:/g, '');
  const c = lampColors[color];
  return <svg className="lamp-art" viewBox="0 0 340 310" role="img" aria-label={`${c.name} renkli masa lambası, ışık ${lit ? 'açık' : 'kapalı'}`}>
    <defs>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0"><stop stopColor={c.dark} /><stop offset=".27" stopColor={c.main} /><stop offset=".6" stopColor={c.light} /><stop offset="1" stopColor={c.main} /></linearGradient>
      <linearGradient id={`${id}-shade`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor={c.light} /><stop offset=".38" stopColor={c.main} /><stop offset="1" stopColor={c.dark} /></linearGradient>
      <radialGradient id={`${id}-light`}><stop stopColor="#fff1b3" stopOpacity={lit ? '.8' : '0'} /><stop offset="1" stopColor="#ffc868" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-shadow`}><stop stopColor="#44342e" stopOpacity=".24" /><stop offset="1" stopColor="#44342e" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-inside`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={lit ? '#ffebaa' : c.dark} /><stop offset="1" stopColor={lit ? '#fff4d5' : c.main} /></linearGradient>
    </defs>
    <ellipse cx="179" cy="277" rx="111" ry="22" fill={`url(#${id}-shadow)`} />
    <ellipse cx="170" cy="218" rx="118" ry="73" fill={`url(#${id}-light)`} />
    <path d="M144 138h51l13 111c2 10-12 18-38 18s-40-8-38-18z" fill={`url(#${id}-body)`} />
    <ellipse cx="170" cy="250" rx="38" ry="11" fill={c.main} />
    <path d="M61 150C64 84 110 39 170 39s106 45 109 111c-5 28-213 28-218 0z" fill={`url(#${id}-shade)`} />
    <ellipse cx="170" cy="151" rx="109" ry="27" fill={c.dark} />
    <ellipse cx="170" cy="149" rx="103" ry="22" fill={`url(#${id}-inside)`} />
    <ellipse cx="170" cy="152" rx="29" ry="9" fill={lit ? '#fff9e7' : c.dark} />
    <path d="M77 112c14-38 43-62 76-67" fill="none" stroke={c.light} strokeWidth="3" strokeLinecap="round" opacity=".48" />
    <path d="M199 255c16 2 20 13 47 16" fill="none" stroke="#9b897c" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

export function LumaDemo() {
  const [color, setColor] = useState<LampColor>('peach');
  const [lit, setLit] = useState(true);
  return <div className={`luma-app luma-${color}`}>
    <div className="luma-header"><strong>luma.</strong><span>OBJELER & HİSLER</span></div>
    <div className="luma-title"><span>biraz sıcaklık.</span><h3>Light, your way.</h3></div>
    <LampArt color={color} lit={lit} />
    <div className="luma-details"><div><strong>Mellow</strong><span>Bir masa lambası denemesi.</span></div><button type="button" className={`luma-power ${lit ? 'lit' : ''}`} aria-label={lit ? 'Işığı kapat' : 'Işığı aç'} aria-pressed={lit} onClick={() => setLit(!lit)}><Power size={16} /></button></div>
    <div className="luma-bottom"><div className="color-swatches" aria-label="Lamba rengi">{(Object.entries(lampColors) as [LampColor, typeof lampColors.peach][]).map(([key, c]) => <button type="button" key={key} style={{ '--swatch': c.main } as React.CSSProperties} aria-label={c.name} aria-pressed={color === key} onClick={() => setColor(key)} />)}</div><span>{lampColors[color].name} <span>↗</span></span></div>
  </div>;
}
