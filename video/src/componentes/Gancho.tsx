import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CORES, FONTE } from "../lib/tema";
import { palavras } from "../lib/tempo";

/**
 * Os 2 primeiros segundos decidem a retencao — por isso o gancho entra grande,
 * palavra por palavra, sem esperar o audio.
 */
export const Gancho: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lista = palavras(texto);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 90px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0 20px",
          fontFamily: FONTE,
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.12,
          color: CORES.texto,
          letterSpacing: -2,
        }}
      >
        {lista.map((palavra, i) => {
          const entrada = spring({
            frame: frame - i * 2.2,
            fps,
            config: { damping: 200, stiffness: 120 },
          });

          return (
            <span
              key={`${palavra}-${i}`}
              style={{
                opacity: entrada,
                transform: `translateY(${(1 - entrada) * 28}px)`,
                display: "inline-block",
              }}
            >
              {palavra}
            </span>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 48,
          width: 140,
          height: 8,
          borderRadius: 4,
          backgroundColor: CORES.teal,
        }}
      />
    </AbsoluteFill>
  );
};
