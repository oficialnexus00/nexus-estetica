import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { CORES } from "../lib/tema";

/** Fundo dark com um brilho teal que respira devagar — nada de distrair do texto. */
export const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const deriva = interpolate(frame, [0, durationInFrames], [0, 12], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: CORES.fundo }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${30 + deriva}%, rgba(0,191,165,0.20) 0%, rgba(0,191,165,0.05) 38%, transparent 62%)`,
        }}
      />
    </AbsoluteFill>
  );
};
