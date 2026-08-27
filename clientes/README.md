# Clientes

Uma pasta por cliente ativo da NEXUS. Cada pasta é o **dossiê completo** daquele
cliente: briefing, oferta, funil, agente de IA, tráfego, integração e PMO de ativação.

## Como abrir um cliente novo

```bash
cp -r "clientes/_modelo" "clientes/nome-do-cliente"
```

Depois: renomeie a pasta pro slug do cliente (minúsculo, sem acento, com hífen —
ex.: `dra-jennifer-harmonizacao`), preencha o `README.md` da pasta e vá de cima
pra baixo nos arquivos numerados. A ordem dos números **é** a ordem da ativação.

## Regras

- **Nunca** commitar senha, token, chave de API ou dado de paciente aqui.
  `02-acessos.md` guarda só o *status* do acesso — o segredo mora no gerenciador
  de senhas da NEXUS.
- Todo item de plano tem **prioridade (P0–P3), dono nomeado e KPI** — padrão PMO
  da casa (`pmo/como-trabalhamos.md`).
- Fonte de verdade do resultado é `09-resultados.md`, atualizado **toda segunda**.
- Cliente que sai vai pra `clientes/_arquivo/` — não se apaga histórico.

## Ativos

| Cliente | Nicho | Entrou em | Status | Dono |
|---|---|---|---|---|
| `novo-cliente` | _a definir_ | _a definir_ | Onboarding | Kaian |
