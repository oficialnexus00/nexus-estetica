# Pendências — NEXUS VET

> Formato PMO da casa: prioridade P0–P3, dono nomeado.
> Atualizado: julho/2026 (após auditoria de consistência).

## P0 — Bloqueiam o avanço (dono: **Kaian**)

- [ ] **1. Aval pra criar os workflows no n8n**, em pasta/projeto separado,
      sem encostar em nada de cliente atual.
- [ ] **2. Instância Evolution dedicada ao vet** (ex.: `bia-vet`) + credencial.
- [ ] **3. Confirmar que a NEXUS será o sistema** (Supabase próprio).
      _Recomendação: sim — nenhum sistema vet tem API aberta, mesma conclusão
      que originou o sistema odonto._
- [ ] **4. Clínica-piloto** — existe alguma veterinária na carteira ou rede de
      contatos? Perfil ideal: pequena, sem sistema, ativa no WhatsApp.
- [ ] **5. Preço** — rivais diretos custam R$147–400/mês.
      _Recomendação: entrar premium (R$859) vendendo sistema completo, não bot._

## P1 — Importantes (dono: **Kaian**)

- [ ] **6. Reaproveitar o codebase do sistema odonto?**
      _Recomendação: sim. Análise mostrou ~75% aproveitável — ver
      [`stack/analise-codebase-odonto.md`](../stack/analise-codebase-odonto.md)._
- [ ] **7. Nome do produto:** "NEXUS Vet"?
- [ ] **8. Nome do agente no vet:** mantém "Bia" ou outro? (o sistema odonto já
      é white-label — na demo o agente aparece como "Patrícia".)
- [ ] **9. Este repositório vira oficial na org `oficialnexus00`?** Público ou privado?

## P1.5 — Vindas da auditoria de consistência

- [ ] **10. Regra do preço.** A regra *"preço só a partir da 4ª mensagem"* é da
      **Bia comercial** (lead de anúncio). Na Bia Vet, o tutor já é cliente da
      clínica — segurar o preço irrita. **Implementamos: responde direto pela
      tabela.** _Confirma?_
- [ ] **11. Identificação do tutor por telefone** (não CPF) no primeiro contato.
      _Confirma?_
- [ ] **12. Protocolo de emergência** — qual o procedimento real da clínica-piloto
      (tem 24h? senão, pra onde encaminhar?).

## P2 — Execução (dono: **Rodrigo** + Claude)

- [x] ~~Ajustar persona/templates às regras oficiais da Bia~~ → **feito**
      (sem perguntas empilhadas, ✅ no lugar de bullet, tom coloquial)
- [x] ~~Auditoria de consistência do pacote~~ → **feito** (8 correções)
- [ ] Roteiro de entrevista de validação com donos de clínica vet (Fase 0).
- [ ] Mapear 5–10 clínicas candidatas a piloto.
- [ ] Testar Fly Vet e VeterIA (demo aberta) e analisar o produto deles.
- [ ] Material de venda (depois do sistema fechado).

## P3 — Depois do piloto escolhido

- [ ] Preencher a Parte A da base de conhecimento com dados da clínica.
- [ ] Rodar `stack/schema-vet.sql` no Supabase e preencher `services`,
      `professionals` e `vaccine_protocols` da clínica.
- [ ] Trocar `SUPABASE_URL` e `CLINIC_ID` no `essencial-vet.workflow.js`.
- [ ] Rodar os 3 níveis do plano de teste.

---

## Resolvidos ✅

- [x] ~~Existe repositório da NEXUS no GitHub?~~ → **sim**, `oficialnexus00/nexus-estetica` (público)
- [x] ~~Regras/tom da Bia~~ → documentadas em `comercial/fluxo-bia.md` do repo-mãe
- [x] ~~Algum sistema vet tem API aberta?~~ → **nenhum** (SimplesVet, LoopVet, Vetus, Vetsys)
- [x] ~~Custo real do lembrete no WhatsApp~~ → ~R$0,03 (Utilidade); chip via Evolution ~grátis até ~100/dia
- [x] ~~Cor oficial da marca~~ → **#00BFA5** (não #14B8A6)
- [x] ~~Dá pra reaproveitar o codebase do odonto?~~ → **~75% sim** (falta só o Kaian aprovar)
