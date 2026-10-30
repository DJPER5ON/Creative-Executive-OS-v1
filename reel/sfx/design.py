"""Build the reel's sound-effects stem, timed to its cuts.

Most effects are cut from the music itself (public/music/forward-pulse.wav,
already aligned to the reel's beat grid), so they share its sound: reversed
swells into cuts, stutter-gated slices on the drop, impacts layered with the
track's own transient. The rest are modelled: wooden slate clacks, two-stage
keyboard clicks, stereo whooshes, a riser and a liquid morph.

Run from reel/:  python3 sfx/design.py   → public/sfx/stem.wav
Cue frames mirror src/Reel.tsx and the scene files; keep them in sync.
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
FPS = 30
LENGTH = 30.0
rng = np.random.default_rng(11)


def read_wav(path):
    with wave.open(path) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
        return a.reshape(-1, w.getnchannels())


def write_wav(path, x):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def sos(kind, f, order=2):
    return signal.butter(order, f, kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=0)


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def stereo(x, pan=0.0):
    """Mono → stereo with constant-power pan (-1 left … 1 right)."""
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def pink(n):
    w = rng.standard_normal(n)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    p = signal.lfilter(b, a, w)
    return p / (np.abs(p).max() + 1e-9)


def room(x, sec=0.6, mix=0.18, damp=6000):
    ir = rng.standard_normal(int(sec * SR)) * np.exp(-t_(sec) * 7)
    ir = filt(ir, "lowpass", damp)
    out = np.zeros((len(x) + len(ir) - 1, 2))
    for ch in range(2):
        irc = np.roll(ir, ch * 97)
        out[:, ch] = signal.fftconvolve(x[:, ch], irc)
    wet = out / (np.abs(out).max() + 1e-9) * np.abs(x).max()
    dry = np.zeros_like(out)
    dry[: len(x)] = x
    return dry + mix * wet


MUSIC = read_wav("public/music/forward-pulse.wav")
BEAT = 16 / FPS


def music_slice(start, sec):
    i = int(start * SR)
    seg = MUSIC[i : i + int(sec * SR)]
    if len(seg) < int(sec * SR):
        seg = np.pad(seg, ((0, int(sec * SR) - len(seg)), (0, 0)))
    return seg.copy()


# ------------------------------------------------------------- sound kit


def ui_tick(bright=1.0):
    t = t_(0.06)
    ping = np.sin(2 * np.pi * 3800 * bright * t) * np.exp(-t * 180)
    snap = filt(rng.standard_normal(len(t)), "bandpass", [2500, 9000]) * np.exp(-t * 600)
    return stereo(0.5 * ping + 0.6 * snap)


def key_click():
    """A keyboard key: soft 'thock' on the way down, small click on release."""
    t = t_(0.09)
    down = filt(rng.standard_normal(len(t)), "bandpass", [700, 2600]) * np.exp(-t * 160)
    body = np.sin(2 * np.pi * rng.uniform(280, 360) * t) * np.exp(-t * 120) * 0.5
    up = np.zeros(len(t))
    j = int(rng.uniform(0.035, 0.05) * SR)
    up[j:] = filt(rng.standard_normal(len(t) - j), "highpass", 3000) * np.exp(-t[: len(t) - j] * 700) * 0.35
    return stereo((down + body + up) * rng.uniform(0.6, 1.0), rng.uniform(-0.25, 0.25))


def whoosh(sec=0.45, pan_from=-0.6, pan_to=0.6):
    n = int(sec * SR)
    x = pink(n + 2048)
    out = np.zeros(n)
    block = 256
    for i in range(0, n, block):
        u = i / n
        fc = 300 * (25 ** (u**1.4))
        seg = filt(x[i : i + block + 1024], "bandpass", [fc * 0.55, min(fc * 1.8, 20000)])
        out[i : i + block] = seg[: len(out[i : i + block])]
    env = np.sin(np.pi * np.clip(np.linspace(0, 1, n) ** 1.8, 0, 1)) ** 1.5
    out *= env
    pans = np.linspace(pan_from, pan_to, n)
    a = (pans + 1) * np.pi / 4
    return np.stack([out * np.cos(a), out * np.sin(a)], axis=1)


def sub_thump(sec=0.9, f0=110, f1=38):
    t = t_(sec)
    f = f1 + (f0 - f1) * np.exp(-t * 22)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    return stereo(np.tanh(2.2 * x) * 0.9)


def impact_from_music(at, sec=0.9):
    """The track's own transient at `at`, low-boosted and saturated, plus a sub thump."""
    hit = music_slice(at, sec)
    hit *= np.exp(-t_(sec) * 7)[:, None]
    hit = np.tanh(2.5 * filt(hit, "lowpass", 2500))
    # A sharp transient right on the frame, so the hit reads on the cut even
    # where the track's own bass swells in a little after the beat.
    t = t_(sec)
    crack = filt(rng.standard_normal(len(t)), "bandpass", [800, 8000]) * np.exp(-t * 90)
    return 0.45 * hit / (np.abs(hit).max() + 1e-9) + sub_thump(sec) + stereo(0.7 * crack)


def reverse_swell(into, sec=0.55):
    """Reverse the music just after `into`, so it swells up and stops on the cut."""
    seg = music_slice(into, sec)[::-1]
    seg = filt(seg, "highpass", 500)
    seg *= (np.linspace(0, 1, len(seg)) ** 2.2)[:, None]
    seg = room(seg, 0.4, 0.3)[: len(seg)]
    return seg / (np.abs(seg).max() + 1e-9)


def stutter(at, repeats=4, frac=0.25):
    """Gate-repeat a 1/16-note slice of the track at `at`, like a DJ stutter."""
    unit = BEAT * frac
    sl = music_slice(at, unit)
    sl *= np.minimum(1, np.linspace(0, 40, len(sl)))[:, None] * np.minimum(1, np.linspace(40, 0, len(sl)))[:, None]
    out = np.concatenate([sl * (0.9 ** k) for k in range(repeats)])
    return filt(out, "highpass", 180)


def glitch(sec=0.12):
    """Short digital glitch: bit-crushed, sample-and-hold slice of noise and tone."""
    t = t_(sec)
    tone = signal.square(2 * np.pi * rng.choice([440, 660, 880, 1320]) * t)
    x = 0.5 * tone + 0.5 * rng.standard_normal(len(t))
    hold = 24
    x = np.repeat(x[::hold], hold)[: len(t)]
    x = np.round(x * 4) / 4 * np.exp(-t * 28)
    return stereo(filt(x, "bandpass", [600, 9000]) * 0.6, rng.uniform(-0.4, 0.4))


def slate_clap():
    """Clapperboard: two wooden plates hitting, modelled as decaying resonant modes."""
    t = t_(0.45)
    modes = [(520, 34), (1230, 48), (2140, 60), (3400, 80)]
    body = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t * d) * (1 / (k + 1)) for k, (f, d) in enumerate(modes))
    crack = filt(rng.standard_normal(len(t)), "highpass", 2500) * np.exp(-t * 260)
    x = crack * 0.9 + body * 0.7
    second = np.zeros_like(x)
    lag = int(0.004 * SR)
    second[lag:] = x[:-lag] * 0.45
    return room(stereo(x + second), 0.35, 0.22)


def shutter():
    out = np.zeros(int(0.22 * SR))
    for at, f in [(0.0, 2400), (0.07, 1700)]:
        t = t_(0.06)
        c = filt(rng.standard_normal(len(t)), "bandpass", [f * 0.6, f * 2.2]) * np.exp(-t * 300)
        c += np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-t * 200) * 0.3
        i = int(at * SR)
        out[i : i + len(c)] += c
    return stereo(out * 0.8)


def riser(sec):
    t = t_(sec)
    u = t / sec
    n = pink(len(t))
    out = np.zeros(len(t))
    block = 512
    for i in range(0, len(t), block):
        fc = 400 * (20 ** u[i])
        seg = filt(n[i : i + block + 1024], "bandpass", [fc * 0.5, min(fc * 1.5, 20000)])
        out[i : i + block] = seg[: len(out[i : i + block])]
    tone = sum(np.sin(2 * np.pi * np.cumsum(f0 * 2 ** (3 * u)) / SR) for f0 in (110, 110.7, 220.4)) * 0.25
    x = (out + tone) * u**2.4
    wide = np.stack([x, np.roll(x, 240)], axis=1)
    return wide / (np.abs(wide).max() + 1e-9)


def liquid_morph(sec=0.7):
    """Gooey swoosh: a pitch-bending tone through a wobbling resonant filter."""
    t = t_(sec)
    f = 180 * 2 ** (1.6 * np.sin(np.pi * t / sec))
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.5 + pink(len(t)) * 0.3
    out = np.zeros(len(t))
    block = 256
    for i in range(0, len(t), block):
        fc = 700 + 1800 * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t[i]))
        seg = filt(tone[i : i + block + 512], "bandpass", [fc * 0.7, fc * 1.4])
        out[i : i + block] = seg[: len(out[i : i + block])]
    env = np.sin(np.pi * t / sec) ** 1.2
    return room(stereo(out * env), 0.5, 0.3)[: len(t)]


# ------------------------------------------------------------- cue sheet

N = int(LENGTH * SR)
stem = np.zeros((N + SR * 3, 2))


def place(x, frame, gain=1.0, end_at=False):
    """Mix x in at `frame`; with end_at=True the sound ends exactly on the frame."""
    x = np.asarray(x)
    i = int(frame / FPS * SR) - (len(x) if end_at else 0)
    i = max(i, 0)
    stem[i : i + len(x)] += x[: len(stem) - i] * gain


def typing(start_frame, chars, cps):
    for k in range(chars):
        place(key_click(), start_frame + k / cps, 0.32)


# Scene cut frames (src/Reel.tsx, 16-frame beats).
INTRO, NAME, ROLES, PHILO, SERVICES, PROCESS, MANIFESTO, CTA, END = 0, 64, 128, 176, 256, 512, 576, 672, 736
SERVICE = 32
F = lambda frame: frame / FPS  # noqa: E731

# Intro: whoosh in, logo snaps solid, "Hello." typed.
place(whoosh(0.6, -0.8, 0.2), 4, 0.35)
place(impact_from_music(F(22), 0.7), 22, 0.55)
typing(33, 6, 0.7)

# Name: reverse swell into the cut, typed name, portrait rises.
place(reverse_swell(F(NAME)), NAME, 0.45, end_at=True)
place(ui_tick(1.1), NAME, 0.6)
typing(NAME + 2, 9, 1)
typing(NAME + 12, 6, 1)
place(whoosh(0.5, 0.5, -0.5), NAME + 12, 0.3)

# Roles: a tick and glitch per role.
for k in range(3):
    place(ui_tick(1 + 0.15 * k), ROLES + 16 * k, 0.55)
    place(glitch(), ROLES + 16 * k, 0.35)

# Philosophy: swell in, stutter on the swap.
place(reverse_swell(F(PHILO), 0.45), PHILO, 0.4, end_at=True)
place(stutter(F(PHILO + 48), 3), PHILO + 48, 0.35)

# Services: the kick enters here; each card gets a whoosh, tick and glitch.
for k in range(8):
    fr = SERVICES + SERVICE * k
    place(whoosh(0.35, -0.5 if k % 2 else 0.5, 0.5 if k % 2 else -0.5), fr, 0.45, end_at=True)
    place(ui_tick(1.2), fr, 0.6)
    place(glitch(0.08), fr + 1, 0.4)
    place(stutter(F(fr), 2), fr, 0.18)
place(shutter(), SERVICES + SERVICE, 0.5)
place(slate_clap(), SERVICES + SERVICE + 8, 0.75)

# Process (breakdown): a whoosh into the cut, then ticks on each line.
place(whoosh(0.4, 0.6, -0.6), PROCESS, 0.4, end_at=True)
place(ui_tick(1.0), PROCESS, 0.6)
place(ui_tick(0.8), PROCESS + 4, 0.45)
place(ui_tick(0.9), PROCESS + 26, 0.45)

# Manifesto (the drop): reverse swell, then impact + stutter on each line.
place(reverse_swell(F(MANIFESTO), 0.9), MANIFESTO, 0.6, end_at=True)
for k, fr in enumerate((MANIFESTO, MANIFESTO + 32, MANIFESTO + 64)):
    place(impact_from_music(F(fr), 0.8), fr, 0.55 if k == 0 else 0.4)
    place(stutter(F(fr), 4), fr, 0.3)

# CTA: typing, riser to the end card, hit on "Let's create".
typing(CTA + 4, 23, 1.1)
place(riser(F(END) - F(CTA)), END, 0.38, end_at=True)
place(impact_from_music(F(CTA + 32), 0.6), CTA + 32, 0.4)

# End card: big impact, liquid morph into PER5ON, final hit.
place(impact_from_music(F(END), 1.2), END, 0.7)
place(glitch(0.15), END, 0.3)
place(liquid_morph(F(END + 80) - F(END + 60)), END + 60, 0.45)
place(impact_from_music(F(END + 80), 0.9), END + 80, 0.5)
place(ui_tick(0.9), END + 20, 0.4)

stem = stem[:N]
stem = np.tanh(stem * 1.2) / np.tanh(1.2)
write_wav("public/sfx/stem.wav", stem / (np.abs(stem).max() + 1e-9) * 0.9)
print("wrote public/sfx/stem.wav", f"{len(stem) / SR:.2f}s")
