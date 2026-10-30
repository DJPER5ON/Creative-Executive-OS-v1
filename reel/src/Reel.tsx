import { Audio } from "@remotion/media";
import React from "react";
import { Series, staticFile } from "remotion";
import { Cta } from "./scenes/Cta";
import { EndCard, NAME_CARD_FRAMES } from "./scenes/EndCard";
import { FinalCta } from "./scenes/FinalCta";
import { Intro } from "./scenes/Intro";
import { Manifesto, MANIFESTO_FRAMES } from "./scenes/Manifesto";
import { Montage, MONTAGE_FRAMES } from "./scenes/Montage";
import { Name } from "./scenes/Name";
import { Philosophy } from "./scenes/Philosophy";
import { Process } from "./scenes/Process";
import { Roles, ROLE_FRAMES } from "./scenes/Roles";
import { Services, SERVICE_FRAMES } from "./scenes/Services";
import { Wheel, WHEEL_FRAMES } from "./scenes/Wheel";
import { BEAT, C, Cut, SfxGain } from "./theme";

export const FPS = 30;

// Every scene is a whole number of beats (16 frames = 112.5 BPM), so cuts land
// on the beat. The music (Forward Pulse) is time-stretched to this grid, with
// its drop on Manifesto (beat 36). sfx/design.py mirrors these cut frames.
export const SCENES: { id: string; component: React.FC; frames: number; cut?: { flash: string } }[] = [
  { id: "Intro", component: Intro, frames: 4 * BEAT },
  { id: "Name", component: Name, frames: 4 * BEAT, cut: { flash: C.lime } },
  { id: "Roles", component: Roles, frames: 3 * ROLE_FRAMES },
  { id: "Philosophy", component: Philosophy, frames: 3 * BEAT },
  { id: "Wheel", component: Wheel, frames: WHEEL_FRAMES },
  { id: "Services", component: Services, frames: 8 * SERVICE_FRAMES },
  { id: "Process", component: Process, frames: 2 * BEAT, cut: { flash: C.violet } },
  { id: "Manifesto", component: Manifesto, frames: 3 * MANIFESTO_FRAMES },
  { id: "Cta", component: Cta, frames: 3 * BEAT },
  { id: "Montage", component: Montage, frames: MONTAGE_FRAMES },
  { id: "NameCard", component: EndCard, frames: NAME_CARD_FRAMES },
  { id: "FinalCta", component: FinalCta, frames: 900 - 52 * BEAT },
];

export const REEL_FRAMES = SCENES.reduce((n, s) => n + s.frames, 0);

export type ReelProps = { music: boolean; sfx?: number; stem?: number };

export const Reel: React.FC<ReelProps> = ({ music, sfx = 0, stem = 0 }) => (
  <SfxGain.Provider value={sfx}>
    {music ? (
      <Audio src={staticFile("music/forward-pulse.wav")} volume={0.95} />
    ) : null}
    {/* Sound-effects stem built by sfx/design.py, cued to the cuts above. */}
    {stem > 0 ? <Audio src={staticFile("sfx/stem.wav")} volume={stem} /> : null}
    <Series>
      {SCENES.map(({ id, component: Scene, frames, cut }) => (
        <Series.Sequence key={id} name={id} durationInFrames={frames}>
          {cut ? (
            <Cut flash={cut.flash} seed={id} volume={0.6}>
              <Scene />
            </Cut>
          ) : (
            <Scene />
          )}
        </Series.Sequence>
      ))}
    </Series>
  </SfxGain.Provider>
);
