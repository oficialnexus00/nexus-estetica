import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CORES, FONTE } from "../lib/tema";

/**
 * Legenda queimada no terco inferior — a maioria assiste sem som, entao o texto
 * precisa carregar o roteiro sozinho.
 */
export const Legenda: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();

  const entrada = interpolate(frame, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 420,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          opacity: entrada,
          transform: `translateY(${(1 - entrada) * 16}px)`,
          backgroundColor: "rgba(10,12,14,0.72)",
          borderRadius: 22,
          padding: "26px 40px",
          textAlign: "center",
          fontFamily: FONTE,
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.2,
          color: CORES.texto,
          letterSpacing: -1,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};
