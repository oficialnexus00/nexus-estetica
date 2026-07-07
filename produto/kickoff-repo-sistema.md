# Kit de kickoff — repositório `nexus-odonto` (sistema odontológico)

> **Como usar (Kaian):**
> 1. Crie o repositório privado `nexus-odonto` no GitHub (New repository →
>    Private).
> 2. Abra uma sessão nova do Claude Code apontando pra ele.
> 3. Cole o **Prompt de kickoff** (seção B) como primeira mensagem.
> O Claude da sessão nova vai criar o CLAUDE.md (seção A) e a estrutura
> inicial sozinho.

---

## A) CLAUDE.md do novo repo (o Claude de lá vai criar este arquivo)

```markdown
# CLAUDE.md — NEXUS Odonto (sistema odontológico)

> Repositório do PRODUTO. A base de conhecimento do negócio vive em
> `oficialnexus00/nexus-estetica` — este repo é só o sistema.

## O que é

Sistema de gestão odontológica da NEXUS INTELIGÊNCIA ARTIFICIAL LTDA
(fundador: Kaian Silva Motta). Compete com Simples Dental, Clinicorp,
CoDental, Feegow e Capim. Diferencial: IA comercial nativa (Bia) +
API aberta inclusa em todos os planos.

## Design partner (piloto)

- **Rodrigo** — DUAS clínicas (a dele + a da esposa), 6 profissionais na
  principal. Usa Capim hoje (fintech BNPL; ERP é a isca deles).
- Acordo: beta = Rodrigo cobre infra (~R$ 140/mês) e usa nas 2 clínicas;
  pós-validação = R$ 297/mês pelas duas, preço de fundador travado.
- Fluxo combinado: casca navegável (Lovable, dados fake, 1–2 semanas) →
  Rodrigo confirma → começa a pagar → desenvolvimento com dado real.

## Escopo v1 (núcleo operacional — decisão do Kaian)

1. Agenda por dentista/cadeira + confirmação automática via Bia (WhatsApp)
2. Pacientes — cadastro, ficha, anamnese simples com alertas
3. Financeiro básico — recebimentos, contas, link de pagamento (PagTrust),
   repasse simples por dentista
4. Dashboard — produção por dentista, no-show, ocupação, recebido no mês,
   origem do paciente
5. Orçamentos simples + follow-up automático da Bia em orçamento não
   aprovado (killer feature)
6. Importador CSV de pacientes/agenda (migração da Capim)
7. API pública + webhooks desde o dia 1 (pilar do produto)

v1.1 (depois): odontograma, evolução clínica, documentos.
FORA: BNPL/financiamento, convênios/TISS (fase 2 — só gerar GTO primeiro),
estoque, multi-unidade avançado, app do paciente.

## Multi-clínica desde o dia 1

O design partner já tem 2 clínicas → multi-tenant com seleção de clínica
no login. Modelagem: organização (Rodrigo) → clínicas → profissionais.

## Stack

- Frontend: Lovable.dev (React/TypeScript). Fluxo: print → prompt preciso.
- Backend: Supabase (Postgres + Edge Functions + RLS). Free no dev,
  Pro (~US$ 25/mês) OBRIGATÓRIO antes de dado real (backup diário + não
  pausa).
- IA: GPTMaker (Bia), automação n8n, pagamentos PagTrust.
- Responsável técnico: Marco.

## Identidade visual

Teal #00BFA5, tipografia Inter, dark-mode minimalista (Apple/Linear).
Logo em `nexus-estetica/empresa/logo/`.

## Regras invioláveis

- LGPD dado de saúde: RLS desde a primeira tabela; NUNCA dado real de
  paciente em projeto Supabase free (sem backup); migração da Capim só
  com termo assinado — nunca copiar dados pelo acesso de cortesia.
- Bia/WhatsApp: preço só a partir da 4ª mensagem; sem perguntas
  empilhadas; ✅ no lugar de bullet.
- Português do Brasil, tom direto; entregável pronto pra colar, não
  orientação conceitual; PMO P0–P3 com dono e KPI.

## Referências no repo de conhecimento (nexus-estetica)

- produto/sistema-odontologico.md — visão, benchmark, roadmap
- produto/piloto-mvp.md — escopo, custos, acordo do piloto
- comercial/benchmark-odonto.xlsx — preços/features dos concorrentes
- stack/integracoes-api-odonto.md — quem tem API aberta (Feegow etc.)
- comercial/checklist-onboarding-ia.md — onboarding da IA (enviado ao
  Rodrigo)
```

## B) Prompt de kickoff (colar como 1ª mensagem da sessão nova)

```
Fala! Este é o repositório do NEXUS Odonto — o sistema de gestão
odontológica da NEXUS. Todo o contexto de negócio já foi decidido e está
resumido abaixo. Tua primeira tarefa:

1. Criar o CLAUDE.md deste repo com o conteúdo que vou colar em seguida
   (vou mandar na próxima mensagem).
2. Criar a estrutura inicial do projeto: docs/ (decisões técnicas),
   e o esqueleto que fizer sentido pra um app Lovable + Supabase.
3. Me devolver o plano da SEMANA 1: a casca navegável no Lovable
   (agenda + pacientes + dashboard com dados fake) — incluindo o
   primeiro prompt pronto pra eu colar no Lovable.

Contexto essencial: design partner Rodrigo (2 clínicas, 6 profissionais,
vem da Capim), escopo v1 = agenda, pacientes, financeiro básico,
dashboard, orçamentos com follow-up de IA, importador CSV, API pública.
Multi-clínica desde o dia 1. Supabase free no dev (SEM dado real),
Pro antes de produção. Identidade: teal #00BFA5, Inter, dark-mode.
```

---

## Divisão dos repositórios (pra não misturar)

| Repo | O que vive lá |
|---|---|
| `nexus-estetica` (este) | Base de conhecimento do NEGÓCIO: empresa, comercial, PMO, decisões |
| `nexus-odonto` (novo) | O PRODUTO: código, docs técnicas, prompts do Lovable, schema do banco |

Decisões de negócio sobre o sistema continuam sendo registradas AQUI
(produto/); o novo repo referencia este.
