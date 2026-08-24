import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CORES, FONTE } from "../lib/tema";

export const Cta: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrada = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 90 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 90px",
      }}
    >
      <div
        style={{
          opacity: entrada,
          transform: `scale(${0.94 + entrada * 0.06})`,
          backgroundColor: CORES.teal,
          borderRadius: 36,
          padding: "64px 56px",
          textAlign: "center",
          fontFamily: FONTE,
          fontSize: 74,
          fontWeight: 800,
          lineHeight: 1.18,
          color: CORES.fundo,
          letterSpacing: -1.5,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};
