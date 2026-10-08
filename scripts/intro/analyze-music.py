"""Estimate musical pulse from low-band and broadband onset autocorrelation.

Input: mono 8 kHz, 16-bit WAV. Reports estimates, not an asserted music tag.
"""
from array import array
from pathlib import Path
import json
import math
import sys
import wave

source = Path(sys.argv[1])
output = Path(sys.argv[2])
with wave.open(str(source), 'rb') as w:
    rate = w.getframerate()
    if w.getsampwidth() != 2 or w.getnchannels() != 1:
        raise ValueError('Expected mono 16-bit PCM for analysis.')
    samples = array('h')
    samples.frombytes(w.readframes(w.getnframes()))
    if sys.byteorder != 'little':
        samples.byteswap()

hop = round(rate * .01)
low, sub, smooth_high = 0.0, 0.0, 0.0
a_low = 1 - math.exp(-2 * math.pi * 240 / rate)
a_sub = 1 - math.exp(-2 * math.pi * 35 / rate)
a_high = 1 - math.exp(-2 * math.pi * 1300 / rate)
energy, bass_energy, high_energy = [], [], []
full = bass = high = 0.0
for i, sample in enumerate(samples):
    value = sample / 32768
    low += a_low * (value - low)
    sub += a_sub * (value - sub)
    smooth_high += a_high * (value - smooth_high)
    full += value * value
    bass += (low - sub) ** 2
    high += (value - smooth_high) ** 2
    if (i + 1) % hop == 0:
        energy.append(math.sqrt(full / hop))
        bass_energy.append(math.sqrt(bass / hop))
        high_energy.append(math.sqrt(high / hop))
        full = bass = high = 0.0


def onsets(values):
    result = [0.0] * len(values)
    for i in range(4, len(values)):
        previous = sum(values[i - 4:i]) / 4
        result[i] = max(0.0, math.log(values[i] + 1e-5) - math.log(previous + 1e-5))
    cap = sorted(result)[int(len(result) * .98)] or 1
    return [min(1.5, x / cap) for x in result]


bass_onsets, full_onsets, high_onsets = map(onsets, [bass_energy, energy, high_energy])
combined = [.65 * b + .25 * f + .1 * h for b, f, h in zip(bass_onsets, full_onsets, high_onsets)]


def correlation(values, lag):
    whole = int(lag)
    fraction = lag - whole
    start = whole + 1
    if start >= len(values):
        return 0.0
    mean = sum(values) / len(values)
    numerator = a_energy = b_energy = 0.0
    for i in range(start, len(values)):
        a = values[i] - mean
        b = values[i - whole] * (1 - fraction) + values[i - whole - 1] * fraction - mean
        numerator += a * b
        a_energy += a * a
        b_energy += b * b
    return numerator / math.sqrt(max(1e-15, a_energy * b_energy))


def tempos(values):
    scores = []
    for step in range(600, 1801, 2):
        bpm = step / 10
        lag = 6000 / bpm
        score = correlation(values, lag) * .8 + correlation(values, lag * 2) * .2
        scores.append((score, bpm))
    peaks = [scores[i] for i in range(1, len(scores) - 1) if scores[i][0] >= scores[i - 1][0] and scores[i][0] >= scores[i + 1][0]]
    peaks.sort(reverse=True)
    picked = []
    for score, bpm in peaks:
        if all(abs(bpm - p['bpm']) >= 2 for p in picked):
            picked.append({'bpm': bpm, 'periodicity': round(score, 3)})
        if len(picked) == 6:
            break
    return picked


# The main body avoids letting an intro fade determine the tempo estimate.
body = combined[800:min(len(combined), 5500)]
candidates = tempos(body)
target = {'bpm': 120, 'periodicity': round(.8 * correlation(body, 50) + .2 * correlation(body, 100), 3)}
near_target = max((x for x in candidates if 110 <= x['bpm'] <= 130), key=lambda x: x['periodicity'], default=None)
sections = []
for start in range(0, 60, 5):
    block = samples[start * rate:min(len(samples), (start + 5) * rate)]
    if not block:
        continue
    rms = math.sqrt(sum((s / 32768) ** 2 for s in block) / len(block))
    peak = max(abs(s) for s in block) / 32768
    sections.append({'start': start, 'end': min(60, start + 5), 'rmsDbFS': round(20 * math.log10(max(rms, 1e-8)), 1), 'peakDbFS': round(20 * math.log10(max(peak, 1e-8)), 1)})

result = {'durationSeconds': len(samples) / rate, 'method': 'Band-limited onset autocorrelation; half/double-time alternatives possible', 'tempoCandidates': candidates, 'target120': target, 'nearTarget': near_target, 'sections': sections}
output.write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result, indent=2))
