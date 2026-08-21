# Aulas — material didático

## Anatomia da Toxina
Material de especialização em toxina botulínica, organizado pela anatomia
estratificada da face: a camada 3 como endereço da toxina, um músculo por
slide, e o mapa facial com o músculo destacado em cada ficha.

| Arquivo | O que é |
|---|---|
| `Anatomia-da-Toxina.pptx` | Deck de 24 slides, 16:9, com notas do apresentador |
| `Anatomia-da-Toxina-Material-de-Apoio.pdf` | Apostila A4 de 11 páginas para os alunos, com espaço de anotação |
| `mapa-muscular-facial.png` | Mapa muscular avulso, para reuso |
| `anatomia-toxina.build.js` | Gera o deck (`node`) |
| `anatomia-toxina.mapa.py` | Gera o mapa facial e as 11 miniaturas destacadas |
| `anatomia-toxina.principios.py` | Gera os 5 diagramas do módulo de princípios |
| `anatomia-toxina.apostila.py` | Gera a apostila em PDF |

Versão web clicável: artefato "Anatomia da Toxina" — clica no músculo e abre
função, pontos, dose, plano e zona de risco.

**Estrutura do deck:** capa → 5 princípios → as 5 camadas → mapa muscular →
um slide por músculo → conversão entre produtos → prevenção de complicações.

**Ordem de regeração:** `anatomia-toxina.mapa.py` e `anatomia-toxina.principios.py`
primeiro (produzem os PNGs), depois `build.js` e `anatomia-toxina.apostila.py`,
que consomem esses PNGs.

Todas as doses em unidades de onabotulinumtoxinA. Material de apoio didático —
não substitui atlas anatômico nem a bula do produto.
