import { Composition, Folder } from "remotion";
import { FPS, Reel, REEL_FRAMES, SCENES } from "./Reel";

const SIZE = { width: 1080, height: 1920, fps: FPS };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Reel-Scenes">
        {SCENES.map((s) => (
          <Composition key={s.id} id={s.id} component={s.component} durationInFrames={s.frames} {...SIZE} />
        ))}
      </Folder>
      <Composition id="Reel" component={Reel} durationInFrames={REEL_FRAMES} {...SIZE} />
    </>
  );
};
