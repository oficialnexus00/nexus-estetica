# Sistemas odonto/clínica compatíveis com a NEXUS (API aberta documentada)

> Mapeamento de quais sistemas de gestão de clínica têm **API pública
> documentada** — ou seja, onde a Bia/n8n conseguem se integrar HOJE, sem
> esperar o sistema próprio da NEXUS. Pesquisado em 02/07/2026.
> Complementa o [`comercial/benchmark-odonto.xlsx`](../comercial/benchmark-odonto.xlsx).

## ✅ Tier 1 — API aberta e documentada (integração viável já)

### Feegow Clinic
- **Docs:** https://docs.feegow.com/
- REST, **200+ endpoints**, aberta a qualquer sistema.
- Auth: token gerado pelo usuário master (header `x-access-token`), com
  permissões por token.
- Cobre: agendamento, pacientes, financeiro etc.
- **Leitura NEXUS:** o mais integrável do benchmark. Clínica que usa Feegow
  pode ter Bia plugada na agenda hoje.

### Clinicorp
- **Docs:** https://sistema.clinicorp.com/api-docs/
- REST com OAuth2. Cobre cadastro de paciente, disponibilidade de agenda e
  agendamento via API.
- Mercado já integra com n8n, Power BI e ContaAzul (vários jobs públicos de
  freelancers fazendo exatamente isso).
- **Leitura NEXUS:** dá pra integrar, mas a API é menos "produto" que a do
  Feegow — validar limites/rate limits na prática.

### Ninsaúde Apolo
- **Docs:** https://www.apolo.app/pt-br/desenvolvedores/ (plataforma "Toro")
- REST, OAuth2 (refresh token + access token de 15 min).
- Posicionamento público de "API aberta / interoperabilidade".
- Multi-especialidade (atende odonto).

### Clínica nas Nuvens
- **Docs:** https://clinicanasnuvens.com.br/api-para-integracao-com-sistemas
- API para desenvolvedores, documentação pública e detalhada.
- Tem versão odonto (software odontológico próprio).

### iClinic
- **Docs:** https://docs.iclinic.com.br/
- Documentação pública (agendamentos, importação de dados).
- Foco médico, não odonto-first — aparece em clínicas de saúde/estética.

### Consultório Live
- **Docs:** https://www.consultorio.live/api/
- API pública para desenvolvedores. Player menor.

## ❌ Tier 2 — SEM API pública (fechados = alvo de ataque)

### Simples Dental
- **Confirmado oficialmente:** a central de ajuda deles declara que **não
  possui API de integração** com outros softwares
  (https://ajuda.simplesdental.com/pt-BR/articles/2667300).
- Única "API" é interna (emissão de NFS).
- **Leitura NEXUS:** o líder de mercado é uma caixa fechada. Clínica presa
  nele não consegue plugar IA nenhuma → argumento de migração pro sistema
  NEXUS.

### CoDental
- Nenhuma documentação pública de API encontrada.
- Automação limitada ao que eles mesmos oferecem (msg cobrada por envio).

## O que isso significa pra estratégia

1. **Curto prazo (antes do sistema próprio):** dá pra vender integração
   Bia ↔ sistema da clínica para quem usa **Feegow, Clinicorp, Ninsaúde,
   Clínica nas Nuvens** — a Bia passa a agendar de verdade dentro do sistema
   deles. Vira receita e aprendizado de domínio antes do MVP.
2. **Discurso de venda:** *"Seu sistema é fechado? Então nem a NEXUS nem
   ninguém consegue automatizar sua clínica. O nosso nasce aberto."*
3. **Nas 5 entrevistas de validação:** perguntar qual sistema usam e cruzar
   com este mapa — se alguma usa Feegow/Clinicorp, ela pode virar piloto de
   integração AGORA (bloco 4 do roteiro).
4. **Produto próprio:** API pública + webhooks desde o MVP (já registrado em
   `produto/sistema-odontologico.md`) — igualar Feegow no ponto forte dele e
   superar todos no resto.

## Pendências de verificação (validar na prática)

- [ ] Criar conta trial no Feegow e testar endpoints críticos (agenda,
    paciente, orçamento) — dono: Marco.
- [ ] Pedir acesso/credencial de API do Clinicorp (cliente ou parceiro?) e
    conferir cobertura real do api-docs.
- [ ] Confirmar se CoDental tem alguma API não divulgada (perguntar ao
    comercial deles).
- [ ] Verificar custo/política de uso das APIs (rate limit, cobrança extra).

## Fontes

- [Feegow — docs oficiais](https://docs.feegow.com/) · [central de ajuda sobre API](https://ajuda.feegow.com/support/solutions/articles/67000714396)
- [Clinicorp — api-docs](https://sistema.clinicorp.com/api-docs/) · [Postman público](https://www.postman.com/orange-trinity-93743/clinicorp/overview) · [job real de integração c/ n8n](https://www.workana.com/job/integracao-de-api-clinicorp-com-n8n-para-agendamento-via-whatsapp)
- [Simples Dental — "não possui API" (oficial)](https://ajuda.simplesdental.com/pt-BR/articles/2667300-o-simples-dental-tem-integracao-via-api-com-outros-softwares)
- [Ninsaúde Apolo — desenvolvedores](https://www.apolo.app/pt-br/desenvolvedores/)
- [Clínica nas Nuvens — API](https://clinicanasnuvens.com.br/api-para-integracao-com-sistemas)
- [iClinic — docs](https://docs.iclinic.com.br/)
- [Consultório Live — API](https://www.consultorio.live/api/)
