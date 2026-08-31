# Nomenclatura e versionamento

Sem padrão de nome, em duas semanas ninguém acha a peça que performou.

## Padrão

```
AAAAMMDD_canal_campanha_formato_angulo_vNN.ext
```

Exemplo:

```
20260831_meta_combolaser_9x16_dorlamina_v03.mp4
20260831_organico_ativacao1500_4x5_provasocial_v01.png
```

| Campo | Valores |
|---|---|
| `canal` | `meta` · `organico` · `wpp` · `lp` · `institucional` |
| `formato` | `9x16` · `4x5` · `1x1` · `16x9` |
| `angulo` | palavra-chave do ângulo criativo (`dorlamina`, `provasocial`, `preco`, `contraintuitivo`) |
| `vNN` | versão da peça, sempre 2 dígitos |

## Onde cada coisa mora

- **Editável** (`.psd`, `.ai`, `.aep`, link Canva/Figma) → `fontes/`
- **Exportado, pronto pra subir** → `pecas/<canal>/`
- **Copy e roteiro** → arquivo `.md` ao lado da peça, mesmo nome base

## Ciclo de vida

| Status | O que significa |
|---|---|
| `rascunho` | em produção, não mostra pra ninguém |
| `aprovado` | passou no checklist, liberado pra subir |
| `no ar` | rodando — registrar data de subida |
| `vencedor` | bateu meta, virou referência (registrar em `banco-de-referencias.md`) |
| `morto` | performou abaixo do piso, pausado (registrar **por quê**) |

> Peça morta não se apaga. O aprendizado do que não funciona vale tanto quanto o do que funciona.
