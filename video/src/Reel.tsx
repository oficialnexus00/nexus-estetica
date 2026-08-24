import { AbsoluteFill, Sequence } from "remotion";
import type { Roteiro } from "./lib/roteiros";
import { montarCronograma } from "./lib/tempo";
import { Fundo } from "./componentes/Fundo";
import { SlotVideo } from "./componentes/SlotVideo";
import { Marca } from "./componentes/Marca";
import { Gancho } from "./componentes/Gancho";
import { Legenda } from "./componentes/Legenda";
import { Cta } from "./componentes/Cta";

/**
 * Template unico de Reel: gancho -> desenvolvimento em legenda -> CTA.
 * Trocar o roteiro gera uma variacao nova sem mexer no visual.
 */
export const Reel: React.FC<{ roteiro: Roteiro }> = ({ roteiro }) => {
  const cronograma = montarCronograma(roteiro);

  return (
    <AbsoluteFill>
      <Fundo />
      <SlotVideo src={roteiro.videoSrc} />
      <Marca />

      <Sequence
        from={cronograma.gancho.inicio}
        durationInFrames={cronograma.gancho.duracao}
      >
        <Gancho texto={roteiro.gancho} />
      </Sequence>

      {cronograma.legendas.map((legenda, i) => (
        <Sequence
          key={i}
          from={legenda.inicio}
          durationInFrames={legenda.duracao}
        >
          <Legenda texto={legenda.texto} />
        </Sequence>
      ))}

      <Sequence from={cronograma.cta.inicio} durationInFrames={cronograma.cta.duracao}>
        <Cta texto={roteiro.cta} />
      </Sequence>
    </AbsoluteFill>
  );
};
