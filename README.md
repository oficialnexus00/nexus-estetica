# NEXUS — Base de conhecimento

Repositório-cérebro da **NEXUS INTELIGÊNCIA ARTIFICIAL LTDA**. Concentra tudo sobre a
empresa, o fundador, o produto, a operação comercial e o stack técnico — para que
pessoas (e o Claude Code) tenham o contexto completo do negócio em um só lugar.

> **Comece por [`CLAUDE.md`](./CLAUDE.md)** — é o contexto-mestre. Todo o resto é
> detalhamento.

## O que é a NEXUS

Healthtech B2B de **automação com IA para clínicas de saúde e estética**. Entrega
agente comercial de IA, automação de WhatsApp, CRM próprio (`app.nexushealth.com.br`)
e gestão de tráfego pago. Atende **50+ clínicas** em todo o Brasil, operação 100%
remota, sede em Balneário Camboriú/SC.

## Mapa do repositório

```
.
├── CLAUDE.md                     # Contexto-mestre (ler primeiro)
├── README.md                     # Este arquivo
├── empresa/                      # A empresa e as pessoas
│   ├── sobre-a-nexus.md          # Perfil institucional, dados cadastrais
│   ├── fundador-kaian.md         # Perfil do Kaian (CEO)
│   ├── equipe.md                 # Time e responsabilidades
│   ├── missao-visao-valores.md   # RASCUNHO — aguarda aprovação
│   └── identidade-visual.md      # Cores, tipografia, estética
├── produto/                      # O que a NEXUS entrega
│   ├── visao-geral.md            # Pacote completo de produto
│   ├── agentes-ia.md             # Bia (comercial) e Aurora (cliente)
│   └── crm-nexushealth.md        # CRM próprio
├── comercial/                    # Motor de vendas
│   ├── principios-validados.md   # O que já foi testado e funciona
│   ├── ativacao-assistida.md     # Porta de entrada do cliente
│   └── fluxo-bia.md              # Regras do fluxo da agente Bia
├── stack/                        # Tecnologia
│   └── stack-tecnico.md          # Ferramentas e arquitetura
├── pmo/                          # Gestão
│   ├── como-trabalhamos.md       # Método PMO (P0–P3, dono, KPI)
│   └── pendencias.md             # Backlog de decisões do Kaian
└── clientes/                     # Um dossiê por cliente ativo
    ├── _modelo/                  # Template — duplicar pra abrir cliente novo
    └── <cliente>/                # Briefing → oferta → agente → tráfego → resultado
```

## Abrir um cliente novo

```bash
cp -r "clientes/_modelo" "clientes/nome-da-clinica"
```

Depois siga o `COMECE-AQUI.md` da pasta. Detalhes em [`clientes/README.md`](./clientes/README.md).

## Como manter atualizado

Quando algo mudar, **atualize o `CLAUDE.md` primeiro** e depois o arquivo de
detalhamento correspondente. O `CLAUDE.md` é a fonte de verdade resumida; as pastas
guardam a profundidade.
