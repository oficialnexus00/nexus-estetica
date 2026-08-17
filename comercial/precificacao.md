# Precificação NEXUS — leitura de mercado e tabela recomendada

> Pesquisa de mercado feita em **17/08/2026**. Complementa
> [`benchmark-odonto.md`](./benchmark-odonto.md) (coleta de 02/07/2026, foco odonto).
> Fontes no fim do arquivo. Preços de tier alto do mercado costumam ser "sob
> consulta" — confirmar em demo antes de usar como argumento de venda.

---

## 1. Como o mercado está precificado hoje

O erro é comparar a NEXUS com "software de clínica". São **três mercados
diferentes** com três tetos diferentes:

| Categoria | Faixa praticada (ago/2026) | Exemplos |
|---|---|---|
| **Software de gestão** (agenda, prontuário, financeiro) | **R$ 39 – 597/mês** | Agendiva 39,90–99,90 · Iter Clinic a partir de 39 · Amplimed 89/profissional · Estetia CRM 149 / 297 / 597 · Clínica nas Nuvens 499 |
| **Software odontológico** | **R$ 89 – 325/mês** + implantação 150–299 | CoDental 89,90–179,90 · Simples Dental 99–325 · Clinicorp a partir de 149,90 · Feegow 129/profissional |
| **Agente de IA no WhatsApp** | **R$ 500 – 1.400/mês** avulso · **R$ 1.800 – 3.500/mês** pacote PME · até 8.000 em alto volume · projeto sob medida ~R$ 18.000 de entrada | SleekFlow a partir de 589 com IA ilimitada · agências e integradores |

**A conclusão que importa:** o teto de um SaaS de gestão é ~R$ 600/mês. O piso de
um agente de IA gerenciado é ~R$ 500 e o pacote típico começa em R$ 1.800. A
NEXUS entrega **CRM + agente de IA + automação + tráfego** — está na categoria de
cima, não na de baixo. Precificar como software de gestão joga fora 3x de receita.

## 2. Tabela recomendada

Cobrança **por clínica** (nunca por profissional), **sem cobrança por mensagem**,
ativação assistida como porta de entrada — nunca desconto
([`principios-validados.md`](./principios-validados.md)).

| | **Essencial** | **Performance** ⭐ | **Growth** |
|---|---|---|---|
| **Mensal** | R$ 247 | **R$ 697** | R$ 1.497 |
| **Anual** (2 meses grátis) | R$ 2.470 | R$ 6.970 | R$ 14.970 |
| CRM nexushealth | ✅ | ✅ | ✅ |
| Automação de WhatsApp | ✅ | ✅ | ✅ |
| Bia (agente comercial de IA) | ✘ | ✅ | ✅ |
| Aurora (canal do cliente ativo) | ✘ | ✘ | ✅ |
| Tráfego pago gerido + criativos | ✘ | ✘ | ✅ (verba mín. R$ 2.000/mês à parte) |
| Ativação assistida | R$ 997 | R$ 997 — **inclusa no anual** | **inclusa** |
| Trial 7 dias (sem IA) | ✅ | ✅ | ✘ |

### Por que estes números

- **R$ 247** — fica acima do miolo dos SaaS de gestão (39–150) sem entrar na
  guerra de preço, e ancora o Performance como "só R$ 450 a mais e a Bia vende
  por você". Serve de **downsell**, não de carro-chefe.
- **R$ 697** — é o **plano recomendado**. Fica ~60% abaixo do pacote típico de
  agência (1.800–3.500) e logo acima do agente avulso (500–1.400), que não tem CRM
  nem ativação. É o preço onde a NEXUS ganha a comparação de qualquer lado que o
  lead compare.
- **R$ 1.497 + verba** — captura a clínica que já gasta com tráfego. Contra
  agência de marketing (fee 1.500–3.000 sem IA e sem CRM), é barato.
- **Ativação de R$ 997** — os concorrentes cobram implantação de R$ 150–299 e
  entregam um treinamento. Cobrar a ativação **protege a base**: quem paga ativa,
  quem ganha de graça não liga. Zerar a ativação no anual é o único "desconto"
  permitido — e ele compra 12 meses de contrato, não desconto de mensalidade.

### Regras de aplicação

1. **Preço só a partir da 4ª mensagem** no fluxo da Bia — regra já validada.
2. Ofertar sempre **Performance primeiro**. Essencial só aparece se o lead
   travar no preço; Growth só se a clínica já investe em anúncio.
3. **Nunca dar desconto na mensalidade.** Se precisar ceder, ceda ativação (no
   anual) ou prazo — nunca o valor recorrente.
4. Reajuste de base antiga: grandfathering por 12 meses, aviso com 60 dias.

### Script de preço da Bia (4ª mensagem, WhatsApp)

```
Fechado! Pelo que você me contou, o plano certo é o Performance 👇

✅ CRM completo com todos os leads num lugar só
✅ Bia atendendo, qualificando e agendando 24h no seu WhatsApp
✅ Follow-up automático de orçamento parado
✅ Ativação assistida — a gente monta tudo pra você, não te entrega no vácuo

R$ 697/mês. No anual, a ativação (R$ 997) sai de graça.

Quer que eu já reserve sua ativação pra essa semana?
```

## 3. Pendência antes de travar a tabela

Falta cruzar com o **custo real por clínica** (GPTMaker + Supabase + ElevenLabs +
WhatsApp Business API + horas de ativação). A tabela acima é defensável pelo
mercado; a margem só fecha com esse número. **Dono: Kaian.**

## Fontes

- [Estetia CRM — planos](https://estetiacrm.com.br/pricing)
- [Agendiva — comparativo de sistemas para clínica de estética](https://agendiva.com.br/melhores-sistemas-para-clinica-de-estetica)
- [Iter Clinic — melhores sistemas para clínica estética 2026](https://www.iterclinic.com/blog/os-6-melhores-sistemas-de-gestao-para-clinica-estetica-no-brasil-testados-em-2026)
- [ClinicaSysPro — quanto custa um sistema para clínica em 2026](https://www.clinicasyspro.com.br/blog/quanto-custa-sistema-para-clinica.html)
- [Zap Trend — quanto custa um agente de IA para WhatsApp](https://zaptrend.com.br/blog/quanto-custa-agente-ia-atendimento-whatsapp/)
- [Clint — custo de agente de IA para WhatsApp 2026](https://www.clint.digital/blog/custo-agente-ia-whatsapp-2026/)
- [SleekFlow — quanto custa um agente de IA](https://sleekflow.io/pt-br/blog/quanto-custa-agente-IA)
- [Forja de Sistemas — preço de agente IA WhatsApp Business API 2026](https://forjadesistemas.com.br/blog/agente-ia-whatsapp-business-api-personalizado-preco-2026/)
</content>
</invoke>
