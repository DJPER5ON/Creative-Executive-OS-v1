"""Synthesize the reel's original sound effects and music bed.

Everything here is generated from oscillators and noise, so the audio is
original and free to publish. Run from the reel/ folder:

    python3 sfx/generate.py

Writes public/sfx/*.wav and public/music/bed.wav. The music sections are
laid out on the same 16-frame beat grid (112.5 BPM at 30 fps) as the scenes
in src/Reel.tsx; keep SECTION_FRAMES in sync with SCENES there.
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
FPS = 30
BEAT_FRAMES = 16
BEAT = BEAT_FRAMES / FPS  # 0.5333 s → 112.5 BPM
rng = np.random.default_rng(7)

# Scene start frames, mirrored from src/Reel.tsx.
SECTION_FRAMES = {
    "intro": 0,
    "roles": 128,
    "services": 256,
    "process": 512,
    "manifesto": 576,
    "cta": 672,
    "end": 736,
    "length": 900,
}


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def noise(sec):
    return rng.uniform(-1, 1, int(sec * SR))


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "highpass", fs=SR, output="sos"), x)


def sweep_sine(f0, f1, sec, k):
    """Sine whose pitch glides exponentially from f0 to f1 with rate k."""
    t = t_axis(sec)
    f = f1 + (f0 - f1) * np.exp(-t * k)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def reverb(x, sec=1.2, mix=0.25):
    ir = noise(sec) * np.exp(-t_axis(sec) * 5)
    wet = signal.fftconvolve(x, lp(ir, 5000))[: len(x) + int(sec * SR)]
    dry = np.pad(x, (0, len(wet) - len(x)))
    return dry + mix * wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max()


def norm(x, peak=0.89):
    return x / (np.abs(x).max() + 1e-9) * peak


def write(path, x):
    x = np.asarray(x)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


# ---------------------------------------------------------------- SFX


def sfx_hit():
    sec = 0.7
    t = t_axis(sec)
    body = sweep_sine(160, 42, sec, 18) * np.exp(-t * 5.5)
    crack = hp(noise(sec), 1800) * np.exp(-t * 45) * 0.6
    return norm(np.tanh(1.6 * (body + crack)))


def sfx_whoosh():
    sec = 0.42
    n = int(sec * SR)
    x = noise(sec)
    out = np.zeros(n)
    block = 512
    for i in range(0, n, block):
        u = i / n
        fc = 250 * (14 ** u)
        out[i : i + block] = bp(x[i : i + block + 256], fc * 0.6, min(fc * 1.6, 20000))[: len(out[i : i + block])]
    env = np.sin(np.pi * np.linspace(0, 1, n) ** 1.6) ** 2
    return norm(out * env, 0.7)


def sfx_zap():
    sec = 0.14
    t = t_axis(sec)
    hops = np.repeat(rng.choice([220, 330, 660, 990, 1320], int(sec * 100) + 1), SR // 100)[: len(t)]
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(hops) / SR))
    crushed = np.round(sq * np.exp(-t * 14) * 6) / 6
    return norm(crushed + 0.3 * hp(noise(sec), 3000) * np.exp(-t * 30), 0.55)


def click(sec=0.03, f=3200):
    t = t_axis(sec)
    return hp(noise(sec), 2000) * np.exp(-t * 400) + 0.4 * np.sin(2 * np.pi * f * t) * np.exp(-t * 300)


def sfx_type():
    sec = 3.0
    out = np.zeros(int(sec * SR))
    pos = 0.0
    while pos < sec - 0.05:
        c = click(0.03, rng.uniform(2600, 3800)) * rng.uniform(0.5, 1.0)
        i = int(pos * SR)
        out[i : i + len(c)] += c
        pos += rng.uniform(0.055, 0.085)
    return norm(out, 0.5)


def sfx_tick():
    t = t_axis(0.05)
    return norm(np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120), 0.45)


def sfx_clap():
    """Film slate snapping shut: two hard wood transients and a short body."""
    sec = 0.35
    t = t_axis(sec)
    snap = bp(noise(sec), 900, 5000) * np.exp(-t * 60)
    second = np.roll(snap, int(0.006 * SR)) * 0.6
    body = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 35) * 0.7
    return norm(reverb(snap + second + body, 0.5, 0.15))


def sfx_riser():
    sec = 4 * BEAT
    t = t_axis(sec)
    u = t / sec
    tone = signal.sawtooth(2 * np.pi * np.cumsum(180 * 10 ** u) / SR) * 0.35
    hiss = hp(noise(sec), 1500) * 0.5
    x = lp(tone + hiss, 9000) * u**2.2
    return norm(x, 0.7)


def sfx_boom():
    sec = 2.4
    t = t_axis(sec)
    sub = sweep_sine(90, 34, sec, 6) * np.exp(-t * 1.6)
    hit = hp(noise(sec), 400) * np.exp(-t * 18) * 0.5
    return norm(np.tanh(1.4 * reverb(sub + hit, 1.4, 0.3)))


def sfx_shutter():
    out = np.zeros(int(0.2 * SR))
    for at, f in [(0.0, 2600), (0.08, 1900)]:
        c = click(0.05, f)
        i = int(at * SR)
        out[i : i + len(c)] += c
    return norm(out, 0.6)


# ---------------------------------------------------------------- music

A, C3, E, F, G, B, D = 220.0, 261.63, 329.63, 174.61, 196.0, 246.94, 293.66
CHORDS = [  # Am – F – C – G, one bar each
    (55.0, [A, C3, E * 1]),
    (43.65, [F, A, C3]),
    (65.41, [C3 / 2 * 2, E, G * 2]),
    (49.0, [G, B, D]),
]


def kick():
    sec = 0.4
    t = t_axis(sec)
    body = sweep_sine(150, 46, sec, 30) * np.exp(-t * 8)
    body[: int(0.01 * SR)] += 0.3 * click(0.01, 4000)
    return body


def hat(open_=False):
    sec = 0.18 if open_ else 0.05
    t = t_axis(sec)
    return hp(noise(sec), 7500) * np.exp(-t * (18 if open_ else 70))


def clap_drum():
    sec = 0.25
    t = t_axis(sec)
    burst = sum(np.roll(bp(noise(sec), 1000, 3500) * np.exp(-t * 40), int(d * SR)) for d in (0, 0.009, 0.018))
    return burst * 0.6


def music_bed():
    s = SECTION_FRAMES
    sec = s["length"] / FPS + 2.5
    n = int(sec * SR)
    L, R = np.zeros(n), np.zeros(n)
    duck = np.ones(n)
    beats = int(sec / BEAT) + 1

    def at(frame):
        return frame / FPS

    def add(x, start, gain=1.0, pan=0.0):
        i = int(start * SR)
        if i >= n:
            return
        x = x[: n - i] * gain
        L[i : i + len(x)] += x * (1 - pan)
        R[i : i + len(x)] += x * (1 + pan)

    def section(t):
        f = t * FPS
        if f < s["roles"]:
            return "intro"
        if f < s["services"]:
            return "groove"
        if f < s["process"]:
            return "full"
        if f < s["manifesto"]:
            return "break"
        if f < s["cta"]:
            return "full"
        if f < s["end"]:
            return "build"
        return "outro"

    k, ch, oh, cl = kick(), hat(), hat(True), clap_drum()
    for b in range(beats):
        t0 = b * BEAT
        sec_name = section(t0)
        bar, beat_in_bar = divmod(b, 4)
        root, notes = CHORDS[bar % 4]
        if sec_name in ("groove", "full"):
            add(k, t0, 0.95)
            env = np.ones(n)
            i = int(t0 * SR)
            m = min(int(0.22 * SR), n - i)
            duck[i : i + m] = np.minimum(duck[i : i + m], 0.35 + 0.65 * np.linspace(0, 1, m) ** 0.6)
        if sec_name != "outro":
            add(ch, t0 + BEAT / 2, 0.22 if sec_name == "intro" else 0.35, pan=0.25)
            if sec_name in ("full", "groove"):
                add(ch, t0 + BEAT / 4, 0.12, pan=-0.25)
                add(ch, t0 + 3 * BEAT / 4, 0.12, pan=-0.25)
            if sec_name == "full" and beat_in_bar in (1, 3):
                add(cl, t0, 0.5)
            if sec_name == "full" and beat_in_bar == 3:
                add(oh, t0 + BEAT / 2, 0.18, pan=0.3)
        if sec_name == "build":
            # Snare roll that doubles in speed toward the end card.
            u = (t0 * FPS - s["cta"]) / (s["end"] - s["cta"])
            hits = 2 if u < 0.5 else 4
            for j in range(hits):
                add(cl, t0 + j * BEAT / hits, 0.25 + 0.4 * u)
        # Bass: off-beat eighth plucks, a long note in the outro.
        if sec_name in ("groove", "full", "build"):
            for off in (0.5,):
                bt = t_axis(BEAT / 2)
                pluck = lp(signal.sawtooth(2 * np.pi * root * bt), 380) * np.exp(-bt * 7)
                add(np.tanh(2 * pluck) * 0.55, t0 + off * BEAT)
        # Arp: sixteenth-note sine plucks over the chord.
        if sec_name in ("full", "break"):
            seq = [notes[0] * 2, notes[1] * 2, notes[2] * 2, notes[1] * 4]
            for j in range(4):
                at_ = t0 + j * BEAT / 4
                at_t = t_axis(BEAT / 4)
                tone = np.sin(2 * np.pi * seq[j] * at_t) * np.exp(-at_t * 16)
                add(tone * (0.16 if sec_name == "full" else 0.22), at_, pan=0.35 if j % 2 else -0.35)
    # Pad: detuned saw chords per bar, low-passed.
    for bar in range(beats // 4 + 1):
        t0 = bar * 4 * BEAT
        if t0 > sec:
            break
        root, notes = CHORDS[bar % 4]
        name = section(t0)
        length = 4 * BEAT if name != "outro" else sec - t0
        bt = t_axis(length)
        pad_l = sum(signal.sawtooth(2 * np.pi * f * 0.998 * bt) for f in notes)
        pad_r = sum(signal.sawtooth(2 * np.pi * f * 1.002 * bt) for f in notes)
        cutoff = 700 if name in ("intro", "break", "outro") else 1400
        att = np.minimum(1, bt / 0.25) * (np.exp(-bt * 0.6) if name == "outro" else 1)
        g = 0.07
        i = int(t0 * SR)
        m = min(len(bt), n - i)
        L[i : i + m] += (lp(pad_l, cutoff) * att * g)[:m]
        R[i : i + m] += (lp(pad_r, cutoff) * att * g)[:m]
        if name == "outro":
            sub_t = t_axis(length)
            sub = np.sin(2 * np.pi * 55 * sub_t) * np.exp(-sub_t * 0.8) * 0.35
            L[i : i + m] += sub[:m]
            R[i : i + m] += sub[:m]
            break
    mix = np.stack([L, R], axis=1) * duck[:, None]
    # Fade the intro in so the first frames start from silence.
    fade = int(0.4 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)[:, None]
    mix = np.tanh(mix * 1.3)
    return norm(mix, 0.8)


def main():
    out = "public/sfx"
    for name, fn in {
        "hit": sfx_hit,
        "whoosh": sfx_whoosh,
        "zap": sfx_zap,
        "type": sfx_type,
        "tick": sfx_tick,
        "clap": sfx_clap,
        "riser": sfx_riser,
        "boom": sfx_boom,
        "shutter": sfx_shutter,
    }.items():
        write(f"{out}/{name}.wav", fn())
    write("public/music/bed.wav", music_bed())
    print("wrote", sorted(os.listdir(out)), "+ public/music/bed.wav")


if __name__ == "__main__":
    main()
