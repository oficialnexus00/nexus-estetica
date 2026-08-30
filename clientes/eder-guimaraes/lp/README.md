# LP — modelo de captação

Arquivo: `index.html` — página única, sem build, sem dependência. Sobe em
qualquer lugar (Vercel, Netlify, Hostinger, Lovable) jogando o arquivo.

## Papel dela no funil

**Não é o destino do tráfego pago no mês 1.** No plano de R$ 1.000
(`../06-trafego.md`) o anúncio vai **direto pro WhatsApp** (Click-to-WhatsApp) —
LP no meio adiciona uma etapa de queda que a verba não banca.

A LP serve pra:

| Uso | Por quê |
|---|---|
| Link da bio do Instagram | Transforma seguidor em conversa, de graça |
| Prova social | É onde o **antes/depois pode viver** — no anúncio, não pode |
| Remarketing (mês 2+) | Público de quem visitou e não chamou |
| Encerrar objeção de preço | O FAQ responde "quanto custa" antes do WhatsApp |

Quando o tráfego passar de ~R$ 3.000/mês, aí sim vale testar LP como destino
contra o WhatsApp direto.

## Os 12 pontos de troca

Todos marcados no HTML com `<!-- ✎ -->`. Ordem de esforço:

1. Nome da clínica (header)
2. Cidade (eyebrow do hero)
3. Nome da profissional (seção "quem vai te atender" + footer)
4. Procedimento (lede do hero + FAQ)
5. Formação e registro
6. Números de prova — **só número real**
7. Depoimentos — reais, com autorização escrita
8. Vagas do mês
9. Endereço
10. **Link do WhatsApp** — 4 ocorrências, buscar `5500000000000`
11. CNPJ e responsável técnica
12. Foto da profissional no lugar do círculo com iniciais

## Antes de publicar

- [ ] Os 4 links do WhatsApp trocados e testados no celular
- [ ] Números de prova conferidos com a clínica (número inventado é passivo)
- [ ] Autorização de imagem de cada depoimento arquivada
- [ ] Pixel instalado — o `data-cta` de cada botão já dispara `Contact`,
      falta só carregar o Pixel na página (`../07-crm-integracao.md`)
- [ ] Testado em tela pequena (iPhone SE) — a barra fixa não pode cobrir o footer
- [ ] Testado nos dois temas (claro e escuro)

## Compliance

O rodapé já traz responsável técnica e a ressalva de variação de resultado.
Antes de subir, checar as regras do conselho da profissional (CFM, CRO, CRBM,
COREN) — algumas vedam antes/depois inclusive em site próprio.

## Notas de implementação

- Fontes: Instrument Serif (display) + Karla (corpo), via Google Fonts
- Tema claro e escuro completos, seguindo o tema do visitante
- Sem imagem externa: o peso da página é só HTML + CSS + as duas fontes
- `data-cta` em cada botão identifica de onde veio o clique (hero, oferta,
  final, dock) — útil pra saber qual seção converte
