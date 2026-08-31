# Criativos & Artes

Área destinada à **criação de criativos e artes da NEXUS** — anúncio, story, reels,
carrossel, thumbnail, peça institucional, arte de LP. Aqui ficam o padrão visual
aplicado à peça, os templates de briefing, o banco de referências e as peças
finalizadas.

> Identidade da marca (logo, cores, tipografia) mora em
> [`../empresa/identidade-visual.md`](../empresa/identidade-visual.md).
> Aqui é a **aplicação** dela em peça de mídia.
> Copy, ganchos e roteiros de conteúdo moram em [`../comercial/`](../comercial/)
> (`reels-conteudo.md`, `stories-humanizacao.md`, `vsl-*.md`).

## Mapa da área

```
criativos/
├── README.md                        # este arquivo
├── padrao-entrega-anuncio.md        # REGRA: o que entregar quando chega uma arte pedindo copy
├── manual-de-arte.md                # identidade aplicada: paleta, grid, formatos, safe zones
├── briefing-criativo.md             # template — 1 briefing por peça, antes de produzir
├── banco-de-referencias.md          # o que já funcionou, o que não funcionou, refs externas
├── nomenclatura-e-versionamento.md  # padrão de nome de arquivo e ciclo de vida da peça
├── checklist-de-aprovacao.md        # QA obrigatório antes de subir qualquer peça
├── prompts-de-geracao.md            # prompts prontos pra IA de imagem/vídeo com a cara da NEXUS
├── fontes/                          # arquivos editáveis (.psd, .ai, links Canva/Figma, .aep)
└── pecas/                           # peças finalizadas, prontas pra subir
    ├── meta-ads/                    # anúncio pago (Click-to-WhatsApp)
    ├── organico/                    # reels, stories, carrossel
    └── institucional/               # apresentação, proposta, assinatura, material de venda
```

## Arte chegou pedindo copy?

Vai direto pro [`padrao-entrega-anuncio.md`](./padrao-entrega-anuncio.md). Regra fixa:
arte jogada aqui é **sempre pra anúncio**, e a entrega é sempre **título + textos da
arte + texto do anúncio + mensagem automática do WhatsApp, em 2 variações de ângulos
diferentes**.

## Fluxo de trabalho

1. **Briefing** — copia [`briefing-criativo.md`](./briefing-criativo.md), preenche.
   Peça sem briefing não entra em produção.
2. **Referência** — checa [`banco-de-referencias.md`](./banco-de-referencias.md).
   Já testamos algo parecido? O que deu certo?
3. **Produção** — segue [`manual-de-arte.md`](./manual-de-arte.md). Editável vai
   pra `fontes/`, exportado vai pra `pecas/`.
4. **Nome do arquivo** — [`nomenclatura-e-versionamento.md`](./nomenclatura-e-versionamento.md).
   Sem padrão, ninguém acha nada em 2 semanas.
5. **QA** — [`checklist-de-aprovacao.md`](./checklist-de-aprovacao.md), item por item.
6. **Subiu → mede → volta pro banco de referências.** Peça sem resultado registrado
   não vira aprendizado.

## Regras da casa (não negociáveis)

Herdadas de [`../comercial/principios-validados.md`](../comercial/principios-validados.md):

- **Humanizado > engessado.** Criativo que parece anúncio de agência não converte
  no nosso ICP. Parece gente falando com gente.
- **Depoimento real de cliente > narração do fundador.** Prova social autêntica
  ganha do discurso do dono.
- **Prova antes de escalar.** Valida em um canal, depois replica.
- **Teal (#00BFA5) com intenção**, nunca como preenchimento.
- **Parece produto de tecnologia premium, não panfleto.**

## Quem faz o quê

| Papel | Dono |
|---|---|
| Direção criativa, aprovação final | Kaian |
| Produção de peça e variações | Kaian / Claude |
| Copy e roteiro | Ver [`../comercial/`](../comercial/) |
| Subida e leitura de métrica (Meta Ads) | Kaian |
