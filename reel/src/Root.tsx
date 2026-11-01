import React from "react";
import { Composition, Folder, Still } from "remotion";
import { FPS, Reel, REEL_FRAMES, SCENES } from "./Reel";
import { LOGO_REVEAL_FRAMES, LogoReveal } from "./scenes/LogoReveal";
import { BRAND_WORLD_FRAMES, BrandWorld, GearPost, GearStill } from "./brand/BrandWorld";
import { GEAR } from "./brand/Gear";

const SIZE = { width: 1080, height: 1920, fps: FPS };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Reel-Scenes">
        {SCENES.map((s) => (
          <Composition key={s.id} id={s.id} component={s.component} durationInFrames={s.frames} {...SIZE} />
        ))}
      </Folder>
      <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} defaultProps={{ music: true, sfx: 0, stem: 0.7 }} {...SIZE} />
      <Composition id="BrandWorld" component={BrandWorld} durationInFrames={BRAND_WORLD_FRAMES} defaultProps={{ music: true }} {...SIZE} />
      <Folder name="Gear-Stills">
        {GEAR.map((g, i) => (
          <React.Fragment key={g.id}>
            <Still id={`Gear-${g.id}`} component={GearStill} defaultProps={{ i, bg: g.bg }} width={1080} height={1920} />
            <Still id={`Post-${g.id}`} component={GearPost} defaultProps={{ i, bg: g.bg }} width={1080} height={1350} />
          </React.Fragment>
        ))}
      </Folder>
      <Folder name="Logo-Reveal">
        <Composition id="LogoReveal-9x16" component={LogoReveal} durationInFrames={LOGO_REVEAL_FRAMES} {...SIZE} />
        <Composition id="LogoReveal-16x9" component={LogoReveal} durationInFrames={LOGO_REVEAL_FRAMES} fps={FPS} width={1920} height={1080} />
        <Composition id="LogoReveal-1x1" component={LogoReveal} durationInFrames={LOGO_REVEAL_FRAMES} fps={FPS} width={1080} height={1080} />
      </Folder>
    </>
  );
};
