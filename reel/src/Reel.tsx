import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, Series, staticFile } from "remotion";
import { Cta } from "./scenes/Cta";
import { EndCard } from "./scenes/EndCard";
import { Intro } from "./scenes/Intro";
import { Manifesto, MANIFESTO_FRAMES } from "./scenes/Manifesto";
import { Name } from "./scenes/Name";
import { Philosophy } from "./scenes/Philosophy";
import { Process } from "./scenes/Process";
import { Roles, ROLE_FRAMES } from "./scenes/Roles";
import { Services, SERVICE_FRAMES } from "./scenes/Services";
import { BEAT, C, Cut, SfxEnabled } from "./theme";

export const FPS = 30;

// Every scene is a whole number of beats (16 frames = 112.5 BPM), so cuts land
// on the beat. sfx/generate.py mirrors these start frames for the music bed.
export const SCENES: { id: string; component: React.FC; frames: number; cut?: { flash: string } }[] = [
  { id: "Intro", component: Intro, frames: 4 * BEAT },
  { id: "Name", component: Name, frames: 4 * BEAT, cut: { flash: C.lime } },
  { id: "Roles", component: Roles, frames: 3 * ROLE_FRAMES },
  { id: "Philosophy", component: Philosophy, frames: 5 * BEAT },
  { id: "Services", component: Services, frames: 8 * SERVICE_FRAMES },
  { id: "Process", component: Process, frames: 4 * BEAT, cut: { flash: C.violet } },
  { id: "Manifesto", component: Manifesto, frames: 3 * MANIFESTO_FRAMES },
  { id: "Cta", component: Cta, frames: 4 * BEAT },
  { id: "EndCard", component: EndCard, frames: 900 - 46 * BEAT },
];

export const REEL_FRAMES = SCENES.reduce((n, s) => n + s.frames, 0);

export type ReelProps = { music: boolean; sfx?: boolean };

export const Reel: React.FC<ReelProps> = ({ music, sfx = true }) => (
  <SfxEnabled.Provider value={sfx}>
    {music ? (
      <Audio
        src={staticFile("music/bed.wav")}
        volume={(f) => interpolate(f, [REEL_FRAMES - 20, REEL_FRAMES], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    ) : null}
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
  </SfxEnabled.Provider>
);
