"""60-second voice-first mix: original score, ElevenLabs SFX and narration.

Standard-library DSP. Produces independent stems and a raw stereo mix.
The prepare script applies two-pass EBU loudness normalization afterwards.
"""
from array import array
from pathlib import Path
import json
import math
import os
import random
import struct
import sys
import wave

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'artifacts' / 'intro'
OUTPUT = Path(os.environ.get('INTRO_MIX_OUTPUT_DIR', str(WORK)))
OUTPUT.mkdir(parents=True, exist_ok=True)
FX_GAIN = float(os.environ.get('INTRO_FX_GAIN', '1'))
if not math.isfinite(FX_GAIN) or not 0 <= FX_GAIN <= 1:
    raise ValueError('INTRO_FX_GAIN must be between 0 and 1.')
TIMING = json.loads((ROOT / 'remotion' / 'intro' / 'timing.json').read_text(encoding='utf-8'))
RATE = 48000
DURATION = 60
N = RATE * DURATION
TAU = math.tau
voice = array('f', [0]) * N
music_l = array('f', [0]) * N
music_r = array('f', [0]) * N
fx_l = array('f', [0]) * N
fx_r = array('f', [0]) * N
rng = random.Random(7061937)


def read_wave(path):
    with wave.open(str(path), 'rb') as stream:
        if stream.getframerate() != RATE or stream.getsampwidth() != 2:
            raise ValueError(f'Expected 48kHz/16-bit audio: {path.name}')
        channels = stream.getnchannels()
        samples = array('h')
        samples.frombytes(stream.readframes(stream.getnframes()))
        if sys.byteorder != 'little':
            samples.byteswap()
    return samples, channels


def write_wave(path, left, right=None):
    with wave.open(str(path), 'wb') as stream:
        stream.setnchannels(2 if right is not None else 1)
        stream.setsampwidth(2)
        stream.setframerate(RATE)
        chunk = bytearray()
        for i, value in enumerate(left):
            a = round(max(-0.999, min(0.999, value)) * 32767)
            if right is not None:
                b = round(max(-0.999, min(0.999, right[i])) * 32767)
                chunk.extend(struct.pack('<hh', a, b))
            else:
                chunk.extend(struct.pack('<h', a))
            if len(chunk) >= 65536:
                stream.writeframesraw(chunk)
                chunk.clear()
        stream.writeframesraw(chunk)


for chapter in TIMING['chapters']:
    samples, channels = read_wave(WORK / 'voice' / f"{chapter['id']}.wav")
    if channels != 1:
        raise ValueError('Narration should be mono before mixing.')
    floats = array('f', (s / 32768 for s in samples))
    peak = max(abs(v) for v in floats)
    active = [v for v in floats if abs(v) > 0.008]
    if not active or peak < 0.01:
        raise ValueError(f"Empty narration: {chapter['id']}")
    rms = math.sqrt(sum(v * v for v in active) / len(active))
    gain = min(0.83 / peak, 0.17 / rms)
    offset = round(chapter['voiceFrom'] / TIMING['fps'] * RATE)
    if offset + len(floats) > N:
        raise ValueError('Narration exceeds the 60-second composition.')
    for i, value in enumerate(floats):
        # Four-millisecond edges remove cut clicks without eating consonants.
        envelope = min(1, i / 192, (len(floats) - i) / 192)
        voice[offset + i] += value * gain * envelope


def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def note(start, duration, midi, volume, pan=0, kind='pad', target=None):
    left, right = target if target else (music_l, music_r)
    offset = round(start * RATE)
    length = min(round(duration * RATE), N - offset)
    if offset < 0 or length <= 0:
        return
    f = frequency(midi)
    lg, rg = math.sqrt((1 - pan) / 2), math.sqrt((1 + pan) / 2)
    for i in range(length):
        t = i / RATE
        if kind == 'pad':
            env = min(1, t / .45) * min(1, max(0, (duration - t) / .65))
            sample = math.sin(TAU * f * t) + .15 * math.sin(TAU * f * 2.001 * t)
        elif kind == 'pluck':
            env = min(1, t / .007) * math.exp(-t * 6)
            sample = math.sin(TAU * f * t) + .22 * math.sin(TAU * f * 2 * t) * math.exp(-t * 6)
        else:
            env = min(1, t / .016) * math.exp(-t * 3) * min(1, max(0, (duration - t) / .1))
            sample = math.sin(TAU * f * t)
        value = sample * env * volume
        left[offset + i] += value * lg
        right[offset + i] += value * rg


external_music = Path(os.environ.get('INTRO_MUSIC_FILE', str(WORK / 'sound' / 'music.wav')))
if external_music.exists():
    samples, channels = read_wave(external_music)
    if channels != 2:
        raise ValueError('Music input must be stereo.')
    count = min(N, len(samples) // 2)
    rms = math.sqrt(sum((v / 32768) ** 2 for v in samples) / len(samples))
    gain = .060 / max(.001, rms)
    for i in range(count):
        music_l[i] = samples[i * 2] / 32768 * gain
        music_r[i] = samples[i * 2 + 1] / 32768 * gain
    music_source = os.environ.get('INTRO_MUSIC_LABEL', 'ElevenLabs Music')
else:
    # Dmaj7 / Bm7 / Gmaj7 / Aadd9. A restrained 120 BPM product-film motif.
    chords = [[50, 54, 57, 61], [47, 50, 54, 57], [43, 47, 50, 54], [45, 49, 52, 59]]
    for bar in range(15):
        start = bar * 4
        notes = chords[bar % 4] if bar < 13 else chords[0]
        for j, midi in enumerate(notes):
            note(start, min(4.6, DURATION - start), midi + 12, .025, (j - 1.5) / 2.4)
        note(start + .05, 1.6, notes[0], .055, kind='bass')
    motif = [74, 78, 81, 78, 73, 76, 81, 78]
    for beat in range(2, 114):
        at = beat * .5
        if beat % 4 in (0, 2, 3):
            level = .024 if at < 12 or at > 48 else .018
            note(at, .85, motif[beat % len(motif)], level, -.3 if beat % 2 else .3, 'pluck')
            note(at + .19, .6, motif[beat % len(motif)], level * .18, .5 if beat % 2 else -.5, 'pluck')
        if beat % 2 == 0 and 6 < at < 56:
            offset = int(at * RATE)
            for i in range(int(.18 * RATE)):
                t = i / RATE
                sample = .045 * math.sin(TAU * (48 * t + 2.8 * (1 - math.exp(-24 * t)))) * math.exp(-t * 26) * min(1, t / .004)
                music_l[offset + i] += sample
                music_r[offset + i] += sample
        if beat % 2 and 10 < at < 54:
            offset = int(at * RATE)
            for i in range(int(.035 * RATE)):
                t = i / RATE
                sample = rng.uniform(-1, 1) * .0035 * math.exp(-t * 105) * min(1, t / .002)
                music_l[offset + i] += sample
                music_r[offset + i] += sample * .7
    music_source = 'Original Python synthesis'


def swish(at):
    path = WORK / 'sound' / 'swish.wav'
    if path.exists():
        place_effect(path, at, .075)
        return
    offset = max(0, round(at * RATE))
    duration = .45
    low = 0
    for i in range(min(round(duration * RATE), N - offset)):
        t = i / RATE / duration
        low += (rng.uniform(-1, 1) - low) * (.02 + .2 * t)
        sample = low * math.sin(math.pi * t) ** 2 * .045
        fx_l[offset + i] += sample * (1 - .4 * t)
        fx_r[offset + i] += sample * (.6 + .4 * t)


def place_effect(path, at, peak_target):
    samples, channels = read_wave(path)
    peak = max(abs(s) for s in samples) / 32768
    gain = peak_target / max(.001, peak)
    offset = round(at * RATE)
    for i in range(min(len(samples) // channels, N - offset)):
        if offset + i < 0:
            continue
        fx_l[offset + i] += samples[i * channels] / 32768 * gain
        fx_r[offset + i] += samples[i * channels + channels - 1] / 32768 * gain


chapters = {c['id']: c for c in TIMING['chapters']}
def moment(name, fraction):
    c = chapters[name]
    return (c['from'] + c['durationInFrames'] * fraction) / TIMING['fps']

for c in TIMING['chapters'][1:]:
    swish(c['from'] / TIMING['fps'] - .12)

for i in range(8):
    note(moment('start', .12 + i * .022), .09, 84 + i % 3, .022, (i % 3 - 1) * .3, 'pluck', (fx_l, fx_r))
for at in [moment('reality', .31), moment('reality', .52), moment('reality', .66)]:
    note(at, .26, 55, .047, kind='pluck', target=(fx_l, fx_r))
    note(at + .08, .23, 54, .030, kind='pluck', target=(fx_l, fx_r))
for at in [moment('design', .56), moment('architecture', .66), moment('craft', .74), moment('delivery', .69)]:
    path = WORK / 'sound' / 'confirm.wav'
    if path.exists():
        place_effect(path, at, .09)
    else:
        note(at, .55, 78, .055, kind='pluck', target=(fx_l, fx_r))
        note(at + .13, .55, 81, .045, kind='pluck', target=(fx_l, fx_r))

end = moment('signature', .32)
for i, midi in enumerate([74, 78, 81]):
    note(end + i * .16, 1.7, midi, .045, (i - 1) * .3, 'pluck', (fx_l, fx_r))

# Side-chain ducking follows the actual narration, not a fixed time range.
out_l, out_r = array('f', [0]) * N, array('f', [0]) * N
envelope = 0.0
for i in range(N):
    target = min(1, abs(voice[i]) * 15)
    coefficient = 1 / (RATE * (.010 if target > envelope else .22))
    envelope += (target - envelope) * coefficient
    duck = 1 - .80 * min(1, envelope * 2.3)
    fade = min(1, i / (RATE * .10)) * min(1, (N - i) / (RATE * .42))
    music_l[i] *= duck * fade
    music_r[i] *= duck * fade
    fx_l[i] *= FX_GAIN
    fx_r[i] *= FX_GAIN
    fx_gain = 1 - .2 * min(1, envelope * 2)
    out_l[i] = (voice[i] + music_l[i] + fx_l[i] * fx_gain) * fade
    out_r[i] = (voice[i] + music_r[i] + fx_r[i] * fx_gain) * fade
peak = max(max(abs(x) for x in out_l), max(abs(x) for x in out_r))
if peak > .94:
    gain = .94 / peak
    for i in range(N):
        out_l[i] *= gain
        out_r[i] *= gain

write_wave(OUTPUT / 'voice-stem.wav', voice)
write_wave(OUTPUT / 'music-stem.wav', music_l, music_r)
write_wave(OUTPUT / 'fx-stem.wav', fx_l, fx_r)
write_wave(OUTPUT / 'raw-master.wav', out_l, out_r)
(OUTPUT / 'mix-report.json').write_text(json.dumps({'seconds': DURATION, 'sampleRate': RATE, 'musicSource': music_source, 'effectsGain': FX_GAIN, 'sidechain': True, 'rawPeakDbFS': round(20 * math.log10(max(.00001, peak)), 2)}, indent=2), encoding='utf-8')
layers = 'narration and music' if FX_GAIN == 0 else 'narration, music and SFX'
print(f'Mixed {DURATION}s of {layers}. Music source: {music_source}.')
