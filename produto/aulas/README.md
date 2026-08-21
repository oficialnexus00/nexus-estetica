# Aulas — material didático

## Anatomia da Toxina
Material de especialização em toxina botulínica, organizado pela anatomia
estratificada da face: a camada 3 como endereço da toxina, um músculo por
slide, e o mapa facial com o músculo destacado em cada ficha.

| Arquivo | O que é |
|---|---|
| `Anatomia-da-Toxina.pptx` | Deck de 18 slides, 16:9, com notas do apresentador |
| `Anatomia-da-Toxina-Material-de-Apoio.pdf` | Apostila A4 de 9 páginas para os alunos, com espaço de anotação |
| `mapa-muscular-facial.png` | Mapa muscular avulso, para reuso |
| `anatomia-toxina.build.js` | Gera o deck (`node`) |
| `anatomia-toxina.mapa.py` | Gera o mapa facial e as 11 miniaturas destacadas |
| `anatomia-toxina.apostila.py` | Gera a apostila em PDF |

Versão web clicável: artefato "Anatomia da Toxina" — clica no músculo e abre
função, pontos, dose, plano e zona de risco.

**Ordem de regeração:** `anatomia-toxina.mapa.py` primeiro (produz os PNGs),
depois `build.js` e `anatomia-toxina.apostila.py`, que consomem esses PNGs.

Todas as doses em unidades de onabotulinumtoxinA. Material de apoio didático —
não substitui atlas anatômico nem a bula do produto.
