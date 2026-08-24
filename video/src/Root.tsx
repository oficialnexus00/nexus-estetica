import { Composition } from "remotion";
import { Reel } from "./Reel";
import { ROTEIROS } from "./lib/roteiros";
import { montarCronograma } from "./lib/tempo";
import { ALTURA, FPS, LARGURA } from "./lib/tema";

/** Cada roteiro do banco vira uma composicao renderizavel. */
export const RemotionRoot: React.FC = () => (
  <>
    {ROTEIROS.map((roteiro) => (
      <Composition
        key={roteiro.id}
        id={roteiro.id}
        component={Reel}
        durationInFrames={montarCronograma(roteiro).total}
        fps={FPS}
        width={LARGURA}
        height={ALTURA}
        defaultProps={{ roteiro }}
      />
    ))}
  </>
);
