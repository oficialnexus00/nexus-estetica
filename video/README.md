# video/ — criativos renderizados com Remotion

Fábrica de criativos de vídeo da NEXUS. Escreve-se o roteiro em TypeScript, o
Remotion cospe MP4 em 1080x1920 na identidade da marca. Serve pra gerar as N
variações de gancho de um Reel sem reeditar nada à mão.

> Separado do `app/` de propósito: `app/` é produto (CRM), isso aqui é marketing.

## Rodar

```bash
cd video
npm install
npm run studio          # editor visual em http://localhost:3000
npm run render reel-1-resposta out/reel-1.mp4
npm run render:todos    # renderiza os 4 roteiros de uma vez
```

## Como está montado

```
src/
├── index.ts                  # entrada (registerRoot)
├── Root.tsx                  # cada roteiro vira uma <Composition>
├── Reel.tsx                  # template: gancho → legendas → CTA
├── lib/
│   ├── roteiros.ts           # OS ROTEIROS — é aqui que se mexe no dia a dia
│   ├── tempo.ts              # ritmo de fala, quebra de legenda, duração
│   └── tema.ts               # #00BFA5, Inter, 1080x1920, 30fps
└── componentes/              # Fundo, Marca, Gancho, Legenda, Cta, SlotVideo
```

**Pra criar uma variação nova:** duplica um objeto em `src/lib/roteiros.ts`, troca
o gancho, dá um `id` novo. A composição aparece sozinha no Studio, com a duração
recalculada a partir da contagem de palavras.

Os roteiros são espelho de `comercial/reels-conteudo.md` — a fonte de verdade
editorial continua sendo o markdown.

## Encaixar a gravação

O template já reserva o lugar do vídeo: sem `videoSrc`, aparece um slot tracejado
marcando onde entra a filmagem. Pra plugar de verdade:

1. joga o arquivo em `video/public/gravacoes/`
2. no roteiro: `videoSrc: "gravacoes/reel-1.mp4"`

## Fonte

Os textos usam Inter com fallback pro stack do sistema. Se a máquina que renderiza
não tiver Inter instalada, sai numa grotesca genérica — parecido, mas não é a
tipografia da marca. Pra travar a fonte no render, instalar `@remotion/google-fonts`
(mesma versão exata dos outros pacotes) e carregar Inter no `Reel.tsx`.

## Chromium (ambientes sem acesso a remotion.media)

O Remotion baixa o próprio Chrome Headless Shell na primeira renderização. Onde
esse download está bloqueado — o caso deste container — aponte um Chromium local:

```bash
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

O `remotion.config.ts` lê essa variável. Na máquina do Kaian não precisa: o
download roda normal.

## Licença

Remotion é grátis pra pessoa física e empresa de até 3 funcionários. A NEXUS tem 4,
então uso comercial exige Company License (a contagem é de headcount da empresa,
não de quem usa a ferramenta). Avaliar sem uso comercial é livre.

- **Creators** — US$ 25/assento/mês. É o plano deste repo hoje: 1 pessoa escrevendo
  os roteiros à mão, volume baixo.
- **Automators** — US$ 0,01/render, mínimo US$ 100/mês. Só vale quando o n8n
  estiver disparando render sozinho.

Detalhes em remotion.pro/license.
