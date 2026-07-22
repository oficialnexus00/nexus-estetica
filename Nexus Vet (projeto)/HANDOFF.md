# HANDOFF — NEXUS Vet (retomada em qualquer conta Claude)

> **Leia este arquivo primeiro.** Ele é auto-suficiente: qualquer conta Claude,
> em qualquer máquina, consegue continuar o projeto só com o que está no repo.
> A memória do assistente é por-conta e **não** viaja — por isso o contexto
> essencial mora aqui e no `CLAUDE.md`.

## O que é

Sistema de gestão para **clínicas veterinárias** com a IA "Bia" nativa (atende,
agenda e traz o pet de volta pela recorrência de vacina). App React em `app/`,
roda em **MODO DEMO** (dados fictícios em memória) — vira real quando o `.env`
receber as chaves do Supabase (`app/.env.example`).

- Contexto-mestre: **`CLAUDE.md`** (raiz)
- Plano de trabalho / checklist viva: **`pmo/roteiro-paridade-simplesvet.md`**

## Está no ar (demo público, um clique, sem login)

🔗 **https://app-zeta-roan-60.vercel.app** — alias fixo de produção na Vercel
(projeto `app`, time `nexus-team-br`). A cada deploy esse link serve a versão nova.

## Rodar local

```bash
cd app && npm install && npm run dev
```
Na tela de login → **"Ver demonstração (dados fictícios)"**.

## Publicar (deploy)

Sempre **reusar o mesmo projeto** (não criar novo):
```bash
cd app && vercel --prod --yes
```
O alias `app-zeta-roan-60.vercel.app` aponta automaticamente pro último deploy.
Requer `vercel` CLI logado na conta certa (time `nexus-team-br`).

## Como trabalhamos (método — seguir sempre)

Por incremento, nesta ordem: **1) mapear** (abrir o módulo no SimplesVet e ver
os campos) → **2) especificar** → **3) construir** no nosso padrão (React +
tokens do design system, dark mode) → **4) testar** no preview (build limpo,
sem erro de console) → **5) publicar** (deploy + commit). **Um item por vez**,
fechado de ponta a ponta. Marcar o item no roteiro a cada entrega.

## Regras / decisões (não violar)

- **Reproduzir funcionalidade e fluxo** do SimplesVet, **nunca** copiar texto/arte/código literal.
- Acesso ao SimplesVet (conta trial, usuário "kaian", logada no Chrome do Rodrigo):
  **só leitura** — não criar/editar/apagar nada na conta deles.
- **Não tocar** no ambiente do Kaian (n8n, Evolution, Supabase) sem aval — construir só neste repo.
- **Reusar infra** existente (mesmo projeto Vercel, mesmo repo) — só criar novo se o Rodrigo pedir.
- Deploy é manual (não automático) — respeita o combinado de não empurrar produção sem intenção.
- Identidade: cor `#00BFA5`, fonte Inter, dark-mode minimalista.

## Estado atual (jul/2026)

Sistema opera de ponta a ponta. Telas: Dashboard (lente Gerencial + Clínica),
Agenda, Tutores & Pets (Pet 360 completo), Financeiro (Resumo/DRE/Análise/
receber/pagar/atraso), **Vendas/PDV**, Estoque, Exames, Reativação (Bia),
Configurações, Bia (placeholder). Documentos em PDF (recibo, comprovante de
vacina, receita/atestado/termo por modelo).

**Paridade com SimplesVet — progresso** (detalhe no roteiro):
- ✅ **Fase 1 — Atendimento clínico** concluída (linha do tempo, tipo de
  atendimento, peso c/ gráfico, patologia, observações, protocolos por pet, documentos por modelo).
- ⏳ **Fase 2 — Vendas/PDV** quase completa: ✅ PDV · ✅ Vendas realizadas ·
  ✅ Saldo dos clientes · ✅ Caixa · ✅ Ranking · ✅ Lista de preços.
  **Falta:** Orçamentos + Pacotes.

**Próximo passo imediato:** terminar **Orçamentos/Pacotes** (fecha a Fase 2) →
depois **Comissionamento** → **Internação** → **Inteligência/BI** → completar
Estoque/Financeiro → menores (Aniversários, NPS, Portal) → Fiscal/Site (decisão do Rodrigo).

## Mapa de código (app/src)

- `App.tsx` — shell, NAV, estado, `Acoes` (todas as ações de escrita, modo demo)
- `data.ts` — tipos + dados demo (fonte da verdade dos formatos)
- `lib/queries.ts` / `lib/mutations.ts` — camada Supabase (produção, ainda não ligada)
- `lib/imprimir.ts` — geração de PDF (recibo, comprovante, documento, cupom)
- `views/` — telas (Dashboard, Agenda, Tutores, Financeiro, Vendas, Estoque, Exames, Reativacao, Configuracoes, Bia)
- `components/` — Pet 360 (LinhaDoTempo, PesoEvolucao, ProtocolosPet, Prontuario, CarteiraVacina, EmitirDocumento), Formularios, Modal

## Quem toca

- **Kaian** — CEO, dono do ambiente n8n/GPTMaker, decide direção.
- **Rodrigo** — conduz o vet (vendas/negócio). É com ele que você fala.
