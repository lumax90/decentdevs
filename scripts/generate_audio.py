"""Original Decent Devs score. Python standard library only; no samples or APIs.

20 seconds, 48 kHz stereo. Warm seventh chords, soft plucks, light percussion,
and transition accents at the exact Remotion scene boundaries.
Run from any directory: python scripts/generate_audio.py
"""

from array import array
from pathlib import Path
import math
import random
import struct
import wave

RATE = 48000
DURATION = 20
TAU = math.tau
COUNT = RATE * DURATION
left = array('f', [0.0]) * COUNT
right = array('f', [0.0]) * COUNT
rng = random.Random(1937)


def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def add_note(start, duration, midi, volume, pan=0.0, kind='pad'):
    offset = round(start * RATE)
    length = min(round(duration * RATE), COUNT - offset)
    freq = frequency(midi)
    l_gain = math.sqrt((1 - pan) / 2)
    r_gain = math.sqrt((1 + pan) / 2)
    for i in range(max(0, length)):
        t = i / RATE
        if kind == 'pad':
            envelope = min(1.0, t / 0.5) * min(1.0, max(0, (duration - t) / 0.9))
            vibrato = 0.003 * math.sin(TAU * 0.3 * t)
            tone = (math.sin(TAU * freq * t + vibrato)
                    + 0.19 * math.sin(TAU * freq * 2.002 * t)
                    + 0.065 * math.sin(TAU * freq * 3 * t))
        elif kind == 'pluck':
            envelope = min(1.0, t / 0.006) * math.exp(-t * 5.2)
            tone = math.sin(TAU * freq * t) + 0.31 * math.sin(TAU * freq * 2 * t) * math.exp(-t * 7)
        else:
            envelope = min(1.0, t / 0.02) * min(1.0, max(0, (duration - t) / 0.12)) * math.exp(-t * 2)
            tone = math.sin(TAU * freq * t) + 0.12 * math.sin(TAU * freq * 2 * t)
        value = volume * envelope * tone
        left[offset + i] += value * l_gain
        right[offset + i] += value * r_gain


chords = [(0, [57, 61, 64, 68]), (5, [54, 57, 61, 64]),
          (10, [50, 54, 57, 61]), (15, [57, 61, 64, 71])]
for start, notes in chords:
    for j, note in enumerate(notes):
        add_note(start, min(5.65, DURATION - start), note, 0.043, (j - 1.5) / 2.4)
    add_note(start + 0.05, 1.8, notes[0] - 12, 0.10, kind='bass')

melody = [76, 73, 71, 68, 73, 76, 80, 76]
for i in range(32):
    start = 0.75 + i * 0.5
    add_note(start, 1.3, melody[i % len(melody)], 0.044 if i % 4 else 0.061,
             pan=(-0.35 if i % 2 else 0.35), kind='pluck')
    add_note(start + 0.185, 0.85, melody[i % len(melody)], 0.012,
             pan=(0.5 if i % 2 else -0.5), kind='pluck')

# A soft, tactile pulse. No aggressive advertising-music transient.
for beat in range(7, 33):
    start = beat * 0.5
    offset = round(start * RATE)
    if beat % 2 == 0:
        for i in range(round(0.21 * RATE)):
            t = i / RATE
            phase = TAU * (48 * t + 3.5 * (1 - math.exp(-22 * t)))
            v = 0.085 * math.sin(phase) * math.exp(-t * 22) * min(1, t / 0.004)
            left[offset + i] += v
            right[offset + i] += v
    for i in range(round(0.045 * RATE)):
        t = i / RATE
        v = rng.uniform(-1, 1) * 0.008 * math.exp(-t * 90) * min(1, t / 0.002)
        left[offset + i] += v * 0.7
        right[offset + i] += v


def transition(at, duration, amplitude):
    offset = round(at * RATE)
    low = 0.0
    previous = 0.0
    for i in range(min(round(duration * RATE), COUNT - offset)):
        t = i / RATE
        position = t / duration
        noise = rng.uniform(-1, 1)
        low += (noise - low) * (0.035 + 0.19 * position)
        band = low - previous
        previous += (low - previous) * 0.018
        envelope = math.sin(math.pi * position) ** 2
        v = band * envelope * amplitude
        left[offset + i] += v * math.sqrt(1 - position)
        right[offset + i] += v * math.sqrt(position)


for cut in [3.2, 6.5, 11.5, 16.0]:
    transition(cut - 0.38, 0.53, 0.047)
    add_note(cut + 0.025, 0.48, 85, 0.04, pan=0.12, kind='pluck')

for at, midi in [(7.4, 73), (8.5, 76), (9.7, 80), (16.25, 76), (16.42, 80), (16.63, 85)]:
    add_note(at, 1.3, midi, 0.042, kind='pluck')

# Final fade and a peak-limited, conservative master with gentle saturation.
peak = 0.0
energy = 0.0
for i in range(COUNT):
    t = i / RATE
    fade = min(1.0, t / 0.18) * min(1.0, max(0.0, (DURATION - t) / 1.05))
    left[i] = math.tanh(left[i] * 1.2) * fade
    right[i] = math.tanh(right[i] * 1.2) * fade
    peak = max(peak, abs(left[i]), abs(right[i]))
    energy += left[i] ** 2 + right[i] ** 2
rms = math.sqrt(energy / (COUNT * 2))
gain = min(0.79 / peak, 0.095 / rms)

output = Path(__file__).resolve().parents[1] / 'public' / 'audio'
output.mkdir(parents=True, exist_ok=True)
path = output / 'studio-score.wav'
with wave.open(str(path), 'wb') as audio:
    audio.setnchannels(2)
    audio.setsampwidth(2)
    audio.setframerate(RATE)
    chunk = bytearray()
    for i in range(COUNT):
        chunk.extend(struct.pack('<hh', round(left[i] * gain * 32767), round(right[i] * gain * 32767)))
        if len(chunk) >= 65536:
            audio.writeframesraw(chunk)
            chunk.clear()
    audio.writeframesraw(chunk)

print(f'Created {path.name}: {DURATION}s, {RATE}Hz, stereo, {20 * math.log10(peak * gain):.1f} dBFS peak.')
