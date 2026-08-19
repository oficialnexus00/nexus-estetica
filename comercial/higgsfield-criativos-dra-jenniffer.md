# Higgsfield — Kit de Criativos | Dra. Jenniffer Miotto (Harmonização Glútea)

> Produção de criativo em vídeo IA pra campanha de captação da clínica dela.
> Destino: **Meta Ads, objetivo Click-to-WhatsApp**, formato 9:16 (Reels/Stories).
> Case e números da NEXUS com ela: `comercial/case-dra-jenniffer-miotto.md`.

---

## 0. LEIA ANTES DE GERAR QUALQUER COISA

Higgsfield é ferramenta de **narrativa e atmosfera**. Não é ferramenta de prova.

| ✅ Pode gerar | ⛔ Não pode gerar |
|---|---|
| Cena de rotina, espelho, provador, praia, academia | Antes/depois de glúteo (real ou simulado) |
| Ambiente de clínica, mãos, recepção, luz | Close/zoom em corpo, bumbum, silhueta sexualizada |
| A própria Dra. falando (Soul ID **com consentimento dela**) | "Paciente" IA dando depoimento — depoimento falso |
| Cena dramatizada declarada | Corpo IA apresentado como resultado do procedimento dela |
| Textura, tecido, movimento, emoção | Qualquer imagem que insinue garantia de resultado |

**Por quê (os três muros):**
1. **CFM/CFBM** — proibido antes/depois em publicidade, proibido prometer resultado, proibido sensacionalismo. Depoimento fabricado é infração direta.
2. **Meta Ads** — política de *"unexpected or negative body focus"*. Anúncio de saúde/estética com enquadramento em parte do corpo é reprovado ou entrega estrangulada. Foco em glúteo é reprovação quase automática.
3. **Confiança** — o público dela é mulher que já foi enganada por promessa de estética. Criativo genérico de IA com corpo perfeito queima a autoridade que a campanha existe pra construir.

**A regra de ouro do kit:** o criativo vende **a decisão**, não o resultado.
Ninguém compra glúteo. Compra parar de se esconder na foto.

---

## 1. Setup no Higgsfield (fazer uma vez)

### 1.1 Soul ID da Dra. Jenniffer — **só com autorização escrita dela**
- Módulo: **Soul → Soul ID (custom character)**
- Subir 15-25 fotos dela: ângulos variados, luz boa, expressões diferentes, fundo limpo.
- Serve pra: gerar variação infinita de frame dela sem ela regravar toda semana.
- ⚠️ Sem autorização formal por escrito, **não treinar**. É biometria facial (LGPD, art. 11).

### 1.2 Soul ID de "persona paciente" — a alternativa legítima
- Cria uma **atriz IA recorrente** (mesma cara em todos os criativos) para as cenas de rotina.
- Ela **nunca** é apresentada como paciente da clínica, nunca dá depoimento, nunca mostra resultado.
- Ela é só o rosto da história. Como atriz de comercial.
- Ganho: consistência visual — o público começa a reconhecer a "cara da marca" dela.

### 1.3 Pastas de biblioteca
```
/dra-jenniffer
  /soul-id-drajenniffer     (frames dela — pós-autorização)
  /soul-id-persona          (atriz recorrente)
  /broll-clinica            (ambiente, mãos, recepção, luz)
  /broll-rotina             (espelho, provador, praia, treino)
  /hooks-2s                 (só os primeiros 2 segundos, banco de teste)
```

### 1.4 Restrição técnica que mexe no roteiro
Higgsfield gera em blocos curtos (≈5s, alguns modelos até 10s). **Todo criativo aqui é
escrito em cenas de 3-5s pra montar depois no CapCut/Premiere.** Não tente pedir um
vídeo de 30s de uma vez — sai com deriva de personagem e movimento quebrado.

---

## 2. Módulos do Higgsfield e pra que usar cada um aqui

| Módulo | Uso nesta campanha |
|---|---|
| **Soul** | Gerar os frames-base (foto realista) que viram vídeo |
| **DoP / Image-to-Video** | Dar movimento de câmera cinematográfico ao frame |
| **Speak** | Talking-head: a Dra. falando, lip-sync a partir de um frame + áudio |
| **Popcorn** | Multi-shot com a MESMA pessoa em cenas diferentes (consistência) |
| **Preset de câmera** | Push In, Crash Zoom, Handheld, 360 Orbit, Whip Pan, Bullet Time |

**Presets que funcionam no hook (2 primeiros segundos):**
- `Crash Zoom In` — tensão instantânea, ótimo pra frase de choque
- `Handheld` — parece real, não parece anúncio (melhor CTR em saúde)
- `Push In` lento — íntimo, bom pra talking-head
- `Whip Pan` — corte de cena sem cortar, segura retenção
- ⛔ Evitar `Bullet Time`, `FPV Drone`, `Robo Arm` aqui: cheiram a IA e quebram a confiança médica.

---

## 3. Os 4 criativos

Cada um: 15-22s, 9:16, texto na tela sempre (80% assiste sem som), CTA de WhatsApp.

---

### CRIATIVO 1 — "O provador" *(ângulo: dor / identificação)*

**Hook (0-2s)** — texto na tela: `Você já devolveu a roupa por causa do espelho?`

| Cena | Dur. | Módulo + preset | Prompt (EN — Higgsfield lê melhor em inglês) |
|---|---|---|---|
| 1 | 3s | Soul → DoP, `Handheld` | `Brazilian woman, 32, in a fitting room, shoulders and face only, warm natural light, she looks at herself in the mirror and her expression drops slightly, adjusts the fabric with her hands, photorealistic, 35mm, shallow depth of field, vertical 9:16` |
| 2 | 3s | DoP, `Push In` | `Close on her hands letting go of the clothing hanger, fitting room curtain, soft light, subtle disappointment, cinematic, photorealistic, vertical 9:16` |
| 3 | 4s | DoP, `Whip Pan` | `Same woman walking out of the store into daylight, mid-shot from the shoulders up, phone in hand, thoughtful, urban Brazilian street, golden hour, handheld camera, photorealistic, vertical 9:16` |
| 4 | 4s | Speak (Dra.) ou card | Dra. Jenniffer falando a fala de virada |
| 5 | 3s | Card estático | CTA |

**Locução / texto na tela:**
1. "Você já provou uma roupa, olhou no espelho e devolveu?"
2. "Não foi o preço. Não foi o tamanho."
3. "Foi a sensação de não se reconhecer ali."
4. *(Dra.)* "Eu atendo mulher assim toda semana. E o primeiro passo nunca é o procedimento — é uma avaliação pra entender se você é candidata."
5. `Agende sua avaliação` → botão WhatsApp

**Por que funciona:** não mostra corpo, não promete nada, e ainda assim mira exatamente a dor. Passa no Meta e passa no CFM.

---

### CRIATIVO 2 — "A avaliação" *(ângulo: autoridade / quebra de objeção)*

**Hook (0-2s)** — Dra. na tela, texto: `Nem toda mulher é candidata. E tudo bem.`

| Cena | Dur. | Módulo + preset | Prompt |
|---|---|---|---|
| 1 | 4s | Speak, `Push In` lento | Frame real dela (ou Soul ID) + áudio da fala 1 |
| 2 | 3s | Soul → DoP, `Handheld` | `Aesthetic clinic consultation room in Brazil, clean modern interior, soft neutral tones, doctor's hands on a clipboard explaining, no faces, warm professional lighting, photorealistic, vertical 9:16` |
| 3 | 3s | DoP, `Push In` | `Close on a woman's face listening attentively during a medical consultation, calm and reassured expression, shallow depth of field, natural window light, photorealistic, vertical 9:16` |
| 4 | 5s | Speak | Fala de fechamento |
| 5 | 3s | Card | CTA |

**Locução:**
1. "Vou te falar uma coisa que anúncio de estética não fala: nem toda mulher é candidata a harmonização glútea."
2. "Tem contraindicação. Tem expectativa que não fecha com a realidade."
3. "Por isso aqui não começa com procedimento. Começa com avaliação."
4. "Se você é candidata, eu te explico exatamente o que dá pra fazer. Se não é, eu falo isso na sua cara — e você não gasta um real."
5. `Avaliação com a Dra. Jenniffer Miotto` → WhatsApp

**Por que funciona:** honestidade é o ângulo mais subexplorado do nicho. Filtra curioso, atrai quem decide. É também o criativo mais seguro em compliance — ele *nega* promessa.

---

### CRIATIVO 3 — "A foto que ela não postou" *(ângulo: desejo, sem mostrar corpo)*

**Hook (0-2s)** — texto: `Quantas fotos suas ficaram na galeria esse ano?`

| Cena | Dur. | Módulo + preset | Prompt |
|---|---|---|---|
| 1 | 3s | Soul → DoP, `Crash Zoom In` | `Close on a smartphone screen showing a photo gallery, a woman's thumb hovering, hesitating to post, natural hand, cozy indoor light, photorealistic, vertical 9:16` |
| 2 | 3s | DoP, `Handheld` | `Group of friends laughing at a beach kiosk in Brazil, one woman slightly behind the others holding a sarong, framed from the shoulders up, golden hour, candid documentary style, photorealistic, vertical 9:16` |
| 3 | 4s | Popcorn (mesma persona) | `Same woman later, sitting confidently with friends, relaxed shoulders, genuine laugh, warm sunset light, candid, photorealistic, vertical 9:16` |
| 4 | 4s | Speak (Dra.) | Fala de virada |
| 5 | 3s | Card | CTA |

**Locução:**
1. "Quantas fotos suas ficaram guardadas esse ano?"
2. "Não porque você não estava linda."
3. "Porque você não estava confortável."
4. *(Dra.)* "Isso é o que eu escuto em consulta — e é sobre isso que a gente conversa antes de qualquer procedimento."
5. `Chama no WhatsApp` → agendar avaliação

> ⚠️ Cena 3 mostra **postura e expressão**, nunca corpo, nunca "depois". Se o editor
> quiser deixar mais parecido com antes/depois — **não deixa.** É exatamente a linha.

---

### CRIATIVO 4 — "Hook factory" *(banco de testes, não é um criativo — é matéria-prima)*

Gera **8 aberturas de 2s** e cola cada uma no corpo do Criativo 2 (o mais estável).
É assim que se acha o gancho vencedor gastando pouco.

Prompt base, trocando só a ação:
```
Brazilian woman, 30s, [AÇÃO], shoulders-up framing, natural indoor light,
candid documentary style, handheld camera, photorealistic, vertical 9:16
```
Ações: `looking at herself in a mirror` · `putting the phone face down` ·
`trying on clothes and sighing` · `scrolling social media at night` ·
`getting ready in front of a bathroom mirror` · `hesitating before entering a clinic` ·
`sitting on the bed thinking` · `smiling to herself for the first time`

Ganchos de texto pra rodar por cima (testar 1 por criativo):
- "Nem toda mulher é candidata. E tudo bem."
- "Você já devolveu uma roupa por causa do espelho?"
- "Antes de fazer, você precisa saber se pode fazer."
- "Não é sobre o bumbum. É sobre parar de se esconder."
- "Se te prometeram resultado antes de te avaliar, corre."
- "3 coisas que te desqualificam pra harmonização glútea."

---

## 4. Regras de prompt no Higgsfield (o que muda o resultado)

1. **Prompt em inglês.** Português entrega qualidade menor e mais artefato.
2. **Ordem que funciona:** `sujeito` → `ação` → `enquadramento` → `luz` → `estilo` → `formato`.
3. **Sempre escrever o enquadramento.** `shoulders-up framing` é o que impede o modelo de
   mostrar corpo inteiro — é a sua trava de compliance dentro do próprio prompt.
4. **`photorealistic` + `candid documentary style`** > `cinematic 8k hyperrealistic`.
   O segundo entrega cara de anúncio de IA. O primeiro entrega cara de real — e real converte.
5. **Negative prompt sempre:** `text, watermark, distorted hands, extra fingers, plastic skin, oversaturated, beauty filter, full body shot, swimwear closeup`
6. **Consistência de pessoa:** Soul ID ou Popcorn. Nunca reprompt do zero — a cara muda e o vídeo perde credibilidade.
7. **Mãos:** o ponto fraco de todo modelo. Se a mão aparece, gera 3 variações e escolhe.
8. **Regravar barato:** frame bom + preset de câmera diferente = criativo "novo" pro Meta.

---

## 5. Como isso entra na campanha

```
Campanha: Harmonização Glútea — Mensagens (Click-to-WhatsApp)
├── Conj. 1 — Frio amplo (mulheres 25-45, praça dela, sem interesse)
│   ├── Criativo 2 (autoridade)  ← esse costuma ser o vencedor no frio
│   ├── Criativo 1 (dor)
│   └── Criativo 3 (desejo)
├── Conj. 2 — Interesse (estética, autocuidado, academia, moda praia)
│   └── mesmos 3, ordem de teste diferente
└── Conj. 3 — Remarketing (engajou perfil/anúncio 30d, não chamou)
    ├── Criativo 2 versão longa (Speak, 40s, ela explicando avaliação)
    └── Card + oferta de agenda da semana
```

- Sempre **3 criativos por conjunto** — o Meta precisa de variação pra otimizar.
- Lead cai no WhatsApp → **Bia** responde em segundos, qualifica, agenda → cai no CRM Nexus Health.
- Bia **não passa preço na primeira mensagem** (princípio validado NEXUS).

**KPIs alvo (benchmark estética/harmonização):** CPL R$ 20-60 · lead→agendamento 10-20% ·
custo por agendamento < 12% do ticket. Se estourar, o problema é criativo antes de ser público.

---

## 6. O que eu preciso da Dra. pra fechar a campanha

Sem isso o kit criativo está pronto, mas a campanha não sobe:

1. **Praça** (cidade/raio de atendimento)
2. **Ticket médio** da harmonização glútea dela
3. **Capacidade** — quantas avaliações/semana ela absorve
4. **Instagram** — pra avaliar se o funil vai direto pro WhatsApp ou passa pelo perfil
5. **Budget diário** disponível
6. **Autorização escrita** pra treinar Soul ID com o rosto dela (LGPD)
7. **1 gravação real de 60s** dela falando — melhor input que existe pro Speak

---

## 7. Checklist antes de subir qualquer criativo

- [ ] Nenhum enquadramento abaixo dos ombros em contexto de corpo
- [ ] Nenhuma imagem que possa ser lida como antes/depois
- [ ] Nenhuma pessoa IA apresentada como paciente real
- [ ] Nenhuma promessa de resultado na copy nem no texto de tela
- [ ] Registro profissional dela visível no card final
- [ ] Disclaimer quando houver menção a transformação: *"resultados variam de pessoa para pessoa"*
- [ ] Autorização da Dra. em dia pra uso de imagem/nome
