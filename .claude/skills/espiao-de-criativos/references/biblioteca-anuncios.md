# Mecânica da Biblioteca de Anúncios do Meta (Ad Library)

Referência técnica pra montar buscas, links e ler o JSON do Apify. Consulte quando
precisar montar uma URL da Biblioteca ou interpretar dados de scraping.

## 1. Como montar as URLs de busca

Base: `https://www.facebook.com/ads/library/`

Os filtros vão como parâmetros na query string. Os que importam:

| Parâmetro | Valores | Pra que serve |
|---|---|---|
| `country` | `BR` (código ISO) | País dos anúncios. Sempre `BR` pro Kaian. |
| `active_status` | `active`, `inactive`, `all` | Use `active` pra ver quem está pagando AGORA. |
| `ad_type` | `all`, `political_and_issue_ads`, `employment_ads`, `housing_ads`, `financial_products_and_services_ads` | Pra clínicas/estética use `all`. |
| `q` | termo de busca | Palavra-chave OU nome do anunciante. Espaço vira `%20`. |
| `search_type` | `keyword_unordered`, `keyword_exact_phrase`, `page` | `keyword_unordered` pra tema; `page` pra buscar por anunciante. |
| `media_type` | `all`, `image`, `video`, `meme` | Filtra formato. `video` isola vídeos (útil pra UGC). |
| `view_all_page_id` | ID numérico da página | Ver TODOS os anúncios ativos de um anunciante específico. |

### Modelos prontos (troque só o que está em MAIÚSCULA)

**Busca por tema/palavra-chave (o caso mais comum):**
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=TERMO&search_type=keyword_unordered&media_type=all
```

**Só vídeos daquele tema (isola UGC/VSL):**
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=TERMO&search_type=keyword_unordered&media_type=video
```

**Busca por nome de anunciante:**
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=NOME_DA_CLINICA&search_type=page&media_type=all
```

**Todos os anúncios ativos de uma página específica (quando você já tem o page id):**
```
https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&view_all_page_id=PAGE_ID
```

> Codificação: espaço = `%20`, "ç"/acentos o navegador resolve, mas pra garantir você
> pode manter o termo simples ("harmonizacao" funciona). Aspas pra frase exata só com
> `search_type=keyword_exact_phrase`.

## 2. Como ler os sinais (o que faz um criativo ser "vencedor")

A Biblioteca mostra, por anúncio, a data de início ("Ativo desde") e todas as
variações. Interprete assim:

- **Tempo ativo:** anúncio rodando há semanas/meses = está dando ROI (ninguém paga pra
  manter criativo ruim no ar). É o sinal nº 1. Copie a estrutura desses.
- **Nº de variações ativas do mesmo anunciante:** muitas variações = está em fase de
  escala/teste agressivo → o nicho tem dinheiro e o player está sério.
- **Repetição de ângulo entre anunciantes diferentes:** se 4 clínicas diferentes usam
  o mesmo gancho ("antes e depois em 30 dias"), o ângulo está comprovado no mercado.
- **Volume total de anunciantes no termo:** muitos anunciantes = mercado quente e
  competitivo (bom pra validar demanda, exige criativo mais forte pra destacar).

Ignore: anúncio único, recém-subido, sem variação — ainda não provou nada.

## 3. Descobrir anunciantes quando você não sabe os nomes

Se não tem nomes de concorrentes na cabeça, use `WebSearch` antes de montar os links:

- `"[procedimento] [cidade] clínica"` → acha players locais.
- `"[procedimento] anúncio instagram"` → acha quem já roda tráfego.
- `"agência tráfego pago [nicho de saúde]"` → acha as agências (que reusam ângulos
  entre vários clientes — mina de ouro de referência).

Depois monte um link `search_type=page` pra cada nome que aparecer.

## 4. Modo Apify — scraping automático

O Kaian tem Apify no stack (usado pra scraping de Meta Ad Library). Quando ele quiser
dados estruturados em vez de abrir link a link, ele roda um actor de Facebook Ad
Library e te cola o JSON. Você não dispara o actor (não tem o token aqui) — você **monta
o input** pra ele colar no Apify e **lê o output**.

### Input típico do actor (o que você entrega pro Kaian colar no Apify)

A maioria dos actors de Ad Library aceita ou uma lista de URLs da Biblioteca (as mesmas
que você montou na seção 1) ou termos + país. Formato geral:

```json
{
  "urls": [
    { "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=harmonizacao%20facial&search_type=keyword_unordered&media_type=all" }
  ],
  "count": 50,
  "scrapePageAds.activeStatus": "active",
  "period": ""
}
```

> O nome exato dos campos varia por actor. O que sempre importa: **a URL da Biblioteca
> já filtrada** (você monta) e o **limite de resultados** (`count`). Se o Kaian disser
> qual actor usa, ajuste os nomes dos campos ao que aquele actor espera.

### Output — campos que importam no JSON

Cada anúncio no array de saída costuma trazer (nomes variam por actor):

- `pageName` / `page_name` — o anunciante.
- `adText` / `snapshot.body.text` — a copy do anúncio (o texto principal). **É aqui que
  você lê o ângulo e o gancho.**
- `startDate` / `ad_delivery_start_time` — desde quando roda (calcule o tempo ativo → sinal nº 1).
- `snapshot.videos` / `snapshot.images` — mídia (URLs do criativo).
- `snapshot.title` / `snapshot.caption` — headline e domínio de destino.
- `collationCount` / número de variações — quantas versões daquele criativo.

### Como analisar o JSON

1. Agrupe por `pageName` → quem tem mais anúncios ativos (escala).
2. Ordene por `startDate` mais antiga → os campeões (mais tempo no ar).
3. Leia os `adText` dos campeões → extraia o padrão de ângulo/gancho/CTA que se repete.
4. Traga 3-5 referências reais pra tabela da Fase 4, com anunciante + tempo ativo +
   link, e use o padrão que você achou pra montar o roteiro NEXUS.

Se o JSON vier vazio ou com poucos resultados, avise o Kaian que o termo é raso e
sugira termos alternativos (mais amplos ou o nome direto de um concorrente).
