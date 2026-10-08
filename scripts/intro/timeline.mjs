export function alignmentWords(alignment, trimStart = 0, speed = 1) {
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
  if (!characters?.length || characters.length !== starts?.length || starts.length !== ends?.length) throw new Error('Karakter hizalama verisi geçersiz.');
  const words = [];
  let text = '', start = 0, end = 0;
  const flush = () => {
    if (text.trim()) words.push({ text: text.trim(), start: Math.max(0, (start - trimStart) / speed), end: Math.max(0, (end - trimStart) / speed) });
    text = '';
  };
  characters.forEach((char, i) => {
    if (!Number.isFinite(starts[i]) || !Number.isFinite(ends[i]) || ends[i] < starts[i]) throw new Error('Ses zaman damgaları geçersiz.');
    if (/\s/.test(char)) { flush(); return; }
    if (!text) start = starts[i];
    text += char; end = ends[i];
  });
  flush();
  return words;
}

export function allocateChapters(script, durations) {
  const fps = script.fps, total = script.durationInFrames, beat = fps / 2;
  const pre = Math.round(fps * .32), post = Math.round(fps * .22);
  const parts = script.chapters.map((chapter, i) => ({
    id: chapter.id,
    voiceDurationInFrames: Math.ceil(durations[i] * fps),
    durationInFrames: Math.ceil((durations[i] * fps + pre + post) / beat) * beat,
  }));
  parts.at(-1).durationInFrames = Math.max(parts.at(-1).durationInFrames, fps * 3);
  const minimum = parts.reduce((sum, p) => sum + p.durationInFrames, 0);
  if (minimum > total) return null;
  const remainingBeats = Math.floor((total - minimum) / beat);
  const order = [6, 2, 3, 1, 5, 0, 4];
  for (let b = 0; b < remainingBeats; b++) parts[order[b % order.length]].durationInFrames += beat;
  parts.at(-1).durationInFrames += total - parts.reduce((sum, p) => sum + p.durationInFrames, 0);
  let from = 0;
  return parts.map(p => {
    const out = { ...p, from, voiceFrom: from + pre };
    from += p.durationInFrames;
    return out;
  });
}

export function captionsForWords(words, offset, limit) {
  const captions = [];
  let group = [];
  const flush = () => {
    if (!group.length) return;
    captions.push({ start: offset + group[0].start, end: Math.min(limit, offset + group.at(-1).end + .12), text: group.map(w => w.text).join(' ') });
    group = [];
  };
  for (const word of words) {
    if (group.length && (group.map(w => w.text).join(' ').length + word.text.length > 62 || word.end - group[0].start > 3.1)) flush();
    group.push(word);
    if (/[.!?;]$/.test(word.text) || group.length >= 9) flush();
  }
  flush();
  return captions.filter(c => c.end > c.start);
}

export function vtt(captions) {
  const stamp = s => {
    const ms = Math.round(s * 1000);
    return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
  };
  return 'WEBVTT\n\n' + captions.map(c => `${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}`).join('\n\n') + '\n';
}
