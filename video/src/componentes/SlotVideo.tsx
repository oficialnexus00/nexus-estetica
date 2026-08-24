import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { CORES, FONTE } from "../lib/tema";

/**
 * Onde entra a gravação (você falando). Sem `src`, mostra o slot vazio pra ficar
 * claro no Studio que falta a filmagem — o texto sozinho ja segura o roteiro.
 */
export const SlotVideo: React.FC<{ src?: string }> = ({ src }) => {
  if (src) {
    return (
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Escurece a gravação pro texto branco continuar legível. */}
        <AbsoluteFill style={{ backgroundColor: "rgba(10,12,14,0.35)" }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: 90 }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 32,
          border: `3px dashed ${CORES.textoSuave}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTE,
          fontSize: 34,
          fontWeight: 600,
          letterSpacing: 1,
          color: `${CORES.textoSuave}88`,
          textAlign: "center",
        }}
      >
        gravação entra aqui
      </div>
    </AbsoluteFill>
  );
};
