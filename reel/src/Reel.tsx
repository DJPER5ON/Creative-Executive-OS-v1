import { Series } from "remotion";
import { Cta } from "./scenes/Cta";
import { EndCard } from "./scenes/EndCard";
import { Intro } from "./scenes/Intro";
import { Manifesto, MANIFESTO_FRAMES } from "./scenes/Manifesto";
import { Name } from "./scenes/Name";
import { Philosophy } from "./scenes/Philosophy";
import { Process } from "./scenes/Process";
import { Roles, ROLE_FRAMES } from "./scenes/Roles";
import { Services, SERVICE_FRAMES } from "./scenes/Services";

export const FPS = 30;

export const SCENES = [
  { id: "Intro", component: Intro, frames: 54 },
  { id: "Name", component: Name, frames: 66 },
  { id: "Roles", component: Roles, frames: 3 * ROLE_FRAMES },
  { id: "Philosophy", component: Philosophy, frames: 78 },
  { id: "Services", component: Services, frames: 8 * SERVICE_FRAMES },
  { id: "Process", component: Process, frames: 72 },
  { id: "Manifesto", component: Manifesto, frames: 3 * MANIFESTO_FRAMES },
  { id: "Cta", component: Cta, frames: 69 },
  { id: "EndCard", component: EndCard, frames: 93 },
];

export const REEL_FRAMES = SCENES.reduce((n, s) => n + s.frames, 0);

export const Reel = () => (
  <Series>
    {SCENES.map(({ id, component: Scene, frames }) => (
      <Series.Sequence key={id} name={id} durationInFrames={frames}>
        <Scene />
      </Series.Sequence>
    ))}
  </Series>
);
