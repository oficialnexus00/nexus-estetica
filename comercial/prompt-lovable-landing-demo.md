# Prompt Lovable — reformulação da landing `demo.nexushealth.com.br`

Diagnóstico e prompt gerados a partir do print da página em 11/08/2026.

## Resumo do diagnóstico

| Gravidade | Problema | Efeito |
|---|---|---|
| 🔴 Crítico | Card "R$ 0,74 custo por lead qualificado" | Número impossível pra quem compra tráfego. Derruba a credibilidade dos outros 3 números junto. |
| 🔴 Crítico | "+22 clínicas atendidas" | Contradiz a base (50+ no `CLAUDE.md`). A empresa se mostra com menos da metade do tamanho real. |
| 🔴 Crítico | "R$ 300 por consulta" na conta da dor | Ticket de consulta médica, não de estética (R$ 1.200–2.500). Dor fica pequena e sinaliza desconhecimento do mercado. |
| 🟠 Alto | "+9% aumento na conversão" | Fraco pra mover decisão e contradiz o "364% de ROI" na mesma linha. |
| 🟠 Alto | Prints de WhatsApp ilegíveis | Prova social que não se lê não é prova. |
| 🟡 Médio | Hero sem produto à vista | Página chamada `demo` que não mostra o produto acima da dobra. |
| 🟡 Médio | CTA "Agendar demonstração" numa URL `demo.` | Promessa da URL ≠ entrega da página. |
| 🟡 Médio | "a partir de hoje" (hero) vs "em menos de 48h" (passo 01) | Inconsistência de prazo na mesma página. |
| 🟢 Baixo | "+" antes de números pequenos (`+22`, `+9%`) | Lê como tentativa de inflar. |
| 🟢 Baixo | Barra superior com contraste baixo | Texto cinza sobre preto, difícil de ler. |

---

## Prompt pra colar no Lovable

```
Contexto: esta é a landing da NEXUS (healthtech B2B de automação com IA para clínicas
de estética). Público: donos de clínica de estética, que compram tráfego e sabem
avaliar número. Mantenha a identidade atual — dark mode, verde #00BFA5, Inter,
estética minimalista. Não redesenhe o visual: corrija conteúdo, credibilidade e
hierarquia.

Faça as alterações abaixo, nesta ordem de prioridade.

--- 1. SEÇÃO DE NÚMEROS (prioridade máxima) ---

Hoje tem 4 cards: "+22 Clínicas atendidas", "+9% Aumento na conversão",
"R$0,74 Custo por lead qualificado", "364% Retorno sobre investimento".

- REMOVA por completo o card "R$0,74 Custo por lead qualificado".
- REMOVA o card "+9% Aumento na conversão".
- Troque "+22" por "50+" e o rótulo para "Clínicas atendidas".
- Mantenha o card de ROI, mas arredonde: "364%" vira "3,6x" com rótulo
  "Retorno médio sobre o investimento".
- Adicione 2 cards novos, com estes rótulos (os valores serão preenchidos depois):
    • "[X] seg" — rótulo "Tempo médio de resposta ao paciente"
    • "[X]%"    — rótulo "Dos atendimentos acontecem fora do horário comercial"
- Remova o sinal "+" da frente dos números. Use "50+" (sufixo), nunca "+50".
- Mantenha a nota de rodapé da seção, ajustada para:
  "Média das clínicas que operam com a NEXUS há mais de 90 dias."

Layout: 4 cards em grid, 2x2 no mobile, 4 colunas no desktop. Números em peso 700 e
tamanho bem maior que o rótulo. Aplique font-variant-numeric: tabular-nums.

--- 2. SEÇÃO DE DOR ("Enquanto você pensa, sua clínica está perdendo dinheiro") ---

No card "Agendamentos perdidos", substitua o texto por:

"Se sua clínica perde 10 pacientes por mês por falta de follow-up, a R$ 1.500 por
procedimento, são R$ 15.000/mês indo pro lixo. Todo mês."

No card "Leads não respondidos", substitua por:

"Lead que não recebe resposta em 5 minutos tem 80% menos chance de agendar. Quantos
chegam pra você às 22h, no domingo, no meio de um procedimento?"

Mantenha o card "Sem visibilidade" como está.

--- 3. PROVA SOCIAL (seção "No primeiro dia, a IA já agenda pacientes") ---

Hoje são prints de WhatsApp/stories pequenos e ilegíveis. Reformule:

- Reduza para no máximo 2 imagens, exibidas grandes o suficiente para o texto da
  conversa ser legível no celular (largura mínima de 320px cada, empilhadas no mobile).
- Adicione abaixo de cada imagem uma legenda em texto real (não dentro da imagem),
  no formato: "Clínica [Nome] — [resultado em uma linha]".
- Adicione um selo/eyebrow acima do título: "PRINTS REAIS DE CLIENTES".
- Se as imagens estiverem em baixa resolução, exiba-as num container com
  max-width e object-fit: contain, sem esticar.

--- 4. HERO ---

- Mantenha o headline atual, ele está bom.
- Ajuste o final do headline: troque "a partir de hoje" por "em 48 horas", para
  bater com o passo 01 da seção "Como funciona na prática".
- Adicione, logo abaixo do CTA, uma linha de prova em texto pequeno:
  "50+ clínicas já operam com a NEXUS."
- Adicione à direita do texto (ou abaixo dele no mobile) um mockup do produto:
  uma conversa de WhatsApp com a IA atendendo, com horário visível de 22h47.
  A página se chama "demo" — o produto precisa aparecer acima da dobra.
- Aumente o contraste da barra superior ("Sistema de IA + CRM + Agenda...").
  O cinza atual sobre fundo preto está abaixo do mínimo legível.

--- 5. NOVAS SEÇÕES ---

Adicione, depois de "Como funciona na prática":

a) Seção "Para quem é" — 3 colunas com os perfis: clínica de estética,
   consultório odontológico, clínica médica. Uma linha de texto em cada.

b) Seção de garantia, antes do CTA final, com o título
   "Você não assume o risco sozinho" e o texto:
   "Ativação assistida: nossa equipe implanta, treina a IA com os seus procedimentos
   e acompanha os primeiros 30 dias. Você não recebe um login e um manual."

c) CTA final repetindo o botão "Agendar demonstração", com o mesmo estilo do hero.

--- 6. REGRAS GERAIS ---

- Nenhum texto novo pode usar "solução", "inovação", "revolucionar" ou "potencializar".
- Toda seção precisa caber no celular sem rolagem horizontal.
- Botões e links precisam de estado de foco visível.
- Não altere as cores, a tipografia nem o espaçamento base do design atual.
```

---

## Números que o Kaian precisa puxar antes de publicar

Os dois cards novos ficam com placeholder até estes dados existirem:

1. **Tempo médio de resposta ao paciente** — puxar do GPTMaker/CRM: intervalo entre a
   mensagem do lead e a resposta da Bia. É o número mais dramático que a NEXUS tem, e
   é honesto.
2. **% de atendimentos fora do horário comercial** — puxar do CRM: mensagens recebidas
   fora de 08h–18h de seg a sex, sobre o total. É o argumento inteiro numa métrica só.

E confirmar: **22 ou 50+ clínicas?** A landing e o `CLAUDE.md` estão divergindo.

---

## Nota estratégica

Esta landing é o **destino do CTA da live** com o grupo do Dr. Gabriel — não é o
material da reunião de parceria. Numa reunião com dono de comunidade, mostrar landing
de vendas enquadra ele como lead. Ver
[`parceria-grupo-estetica-dr-gabriel.md`](./parceria-grupo-estetica-dr-gabriel.md).
