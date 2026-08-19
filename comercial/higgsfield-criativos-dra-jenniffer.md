# Higgsfield — Biblioteca de Takes de Mecanismo | Dra. Jenniffer Miotto

> **O que é isso:** banco de takes em vídeo IA de **mecanismo de ação** — como o
> ácido hialurônico entra nas camadas do rosto, como o bioestimulador age no
> glúteo, o que cada um faz e o que **não** faz.
>
> **Como usa:** ela grava falando (take real). Esses takes entram **por cima** da
> fala, como B-roll científico. Não é pra fazer o vídeo inteiro na IA — é pra
> fazer a parte que ela não consegue gravar.
>
> Conteúdo de mecanismo é o formato mais seguro e mais escalável do nicho:
> não é antes/depois, não promete resultado, e posiciona ela como quem **explica**
> em vez de quem **vende**.

---

## 0. Por que esse formato ganha

O nicho inteiro anuncia resultado. Quase ninguém anuncia **entendimento**.

Quando a paciente vê a camada da pele, a cânula no plano certo, o fibroblasto
acordando — ela não aprende só o procedimento. Ela aprende que **existe técnica**,
e que técnica exige quem sabe. Isso faz três coisas de uma vez:

1. **Filtra** — quem quer preço baixo se desinteressa; quem quer segurança fica.
2. **Justifica ticket** — ninguém pechincha o que entendeu ser complexo.
3. **Passa em compliance** — é conteúdo educativo, não publicidade de resultado.

E o "o que NÃO faz" é o ativo mais valioso da biblioteca. É contraintuitivo, gera
retenção, e chega na consulta com a expectativa já alinhada — que é onde a maioria
das vendas de bioestimulador morre.

---

## 1. Como a produção realmente funciona (leia antes de gastar crédito)

**O fluxo que dá certo:**
```
Soul (gera o frame parado, caprichado)
  → escolhe/corrige o melhor frame
  → DoP / Image-to-Video (dá movimento de câmera)
  → CapCut/AE: rótulos, setas, legenda, marca
```

**Três verdades sobre gerar anatomia com IA — planeje em cima delas:**

1. **A IA não escreve.** Nunca peça rótulo, texto ou legenda dentro do prompt —
   sai borrado e errado. **Todo rótulo ("derme", "SMAS", "periósteo") entra na
   edição.** Isso não é limitação, é o certo: o rótulo fica nítido e você troca
   sem regerar.
2. **A IA entrega beleza, não precisão.** O take é *evocativo*, não é atlas de
   anatomia. Quem garante a precisão é a **fala dela** e o rótulo que você põe por
   cima. Se um corte sair anatomicamente errado, descarta — não publica torto com
   a voz dela por cima afirmando.
3. **Gere em blocos de 3-5s.** Movimento lento e contínuo. Take de mecanismo não
   precisa de ação — precisa de deriva de câmera calma.

**Presets de câmera que servem aqui:**
| Preset | Uso |
|---|---|
| `Push In` / `Dolly In` lento | Padrão de quase todo take. Entra na camada. |
| `Crash Zoom In` | **A transição-assinatura**: pele → nível microscópico. Usa 1x por vídeo. |
| `360 Orbit` | Girar o corte anatômico. Impressiona e mostra profundidade. |
| `Slow Motion` | Gel, água, fibra de colágeno. Tudo fica mais caro. |
| `Macro` / `Handheld` sutil | Dá vida sem parecer animação de banco de imagem. |
| ⛔ `FPV Drone`, `Robo Arm`, `Bullet Time` | Cheiram a IA e quebram o tom clínico. |

---

## 2. Sistema visual — a regra que faz tudo parecer uma coisa só

**Cole este sufixo em TODO prompt da biblioteca.** É o que faz 20 takes gerados em
dias diferentes parecerem a mesma série:

```
STYLE SUFFIX (colar no fim de todo prompt):
medical 3D render, scientific visualization style, teal (#00BFA5) and warm ivory
palette, deep near-black background, soft volumetric lighting, subtle rim light,
ultra detailed, macro lens, shallow depth of field, no text, no labels,
vertical 9:16
```

```
NEGATIVE PROMPT (todo take):
text, letters, labels, watermark, logo, blood, gore, open wound, surgery,
distorted anatomy, extra limbs, full body, nudity, cartoon, plastic toy look,
oversaturated, cluttered
```

> ⚠️ `blood, gore, open wound, surgery` no negative **não é frescura** — o Meta
> reprova criativo médico com aparência gráfica/chocante. Corte anatômico
> estilizado passa; agulha furando pele com sangue não passa. Mantenha limpo e
> abstrato e a entrega não estrangula.

---

## 3. BLOCO A — Ácido Hialurônico no rosto (camadas e planos)

**A ciência que a fala dela precisa sustentar:**
A pele do rosto é em camadas: epiderme → derme → gordura superficial → SMAS →
gordura profunda → músculo → periósteo/osso. O AH não vai "no rosto" — vai **num
plano específico**, escolhido pelo objetivo. Estrutura e projeção pedem plano
profundo, sobre o periósteo. Hidratação e linha fina pedem plano superficial. AH é
hidrofílico: atrai água e por isso dá volume. E — o ponto de segurança que vale
ouro no criativo — **é reversível com hialuronidase**.

---

**A1 — O corte anatômico (take de abertura)**
`Push In` lento · 4s
```
Anatomical cross-section of human facial skin, clearly separated horizontal layers
from top to bottom: epidermis, dermis with fine collagen fibers, superficial fat
compartment, SMAS fascia layer, deep fat pad, muscle, periosteum over bone,
[STYLE SUFFIX]
```
→ Na edição: rotula as 7 camadas uma por uma, em cascata, no ritmo da fala dela.

**A2 — A cânula no plano certo**
`Dolly In` · 4s
```
Blunt-tip cannula sliding horizontally through the deep subcutaneous plane of a
facial tissue cross-section, tissue layers gently parting around it without
tearing, semi-transparent tissue, a soft teal glow tracing the cannula path,
[STYLE SUFFIX]
```
→ Fala dela: *"não é onde dói menos, é onde o produto faz o que precisa fazer."*

**A3 — Depósito sobre o periósteo (projeção estrutural)**
`Push In` · 4s
```
Translucent hyaluronic acid gel being deposited as a rounded bolus directly on the
periosteum above the cheekbone, tissue cross-section view, the clear gel refracting
light like glass jelly, the layers above subtly lifting and reshaping the contour,
[STYLE SUFFIX]
```

**A4 — Por que dá volume (hidrofilia)** ← *o take mais bonito da biblioteca*
`Slow Motion` + `Macro` · 5s
```
Abstract microscopic visualization, a translucent hyaluronic acid molecular chain
attracting hundreds of tiny water droplets that bind along its structure, the chain
swelling and becoming plump and glossy, suspended in dark fluid, drifting slowly,
[STYLE SUFFIX]
```

**A5 — Plano superficial x plano profundo**
Split-screen · 4s
```
Split comparison of the same facial tissue cross-section, left side showing clear
gel placed in the superficial dermis spreading thinly, right side showing denser
gel placed deep on the periosteum creating structural lift, identical lighting and
scale on both sides, [STYLE SUFFIX]
```

**A6 — Reversibilidade (o take de segurança)**
`Push In` lento · 4s
```
Enzyme particles dissolving a translucent gel bolus inside a tissue cross-section,
the gel breaking into smaller fragments and fading away, the tissue returning to
its original contour, calm reverse-timelapse feel, [STYLE SUFFIX]
```
→ Esse é o take que fecha objeção de medo. Vale um criativo inteiro só dele.

**A7 — Transição-assinatura: pele → microscópico**
`Crash Zoom In` · 3s
```
Extreme close macro of calm human skin surface texture, the camera rushing forward
past the surface into the translucent dermal layer below, collagen fibers appearing
as the view descends, continuous seamless motion, [STYLE SUFFIX]
```
→ Usa uma vez por vídeo, na virada do "por fora" pro "por dentro".

---

## 4. BLOCO B — Bioestimulador de colágeno no glúteo

**A ciência que a fala dela precisa sustentar:**
Bioestimulador (PLLA, PCL, hidroxiapatita de cálcio) **não é preenchedor**. Ele é
injetado no subcutâneo e provoca uma resposta inflamatória controlada: o corpo
recruta fibroblastos, e o fibroblasto passa a produzir colágeno — primeiro tipo III,
fino e desorganizado, que amadurece em **tipo I**, espesso e estruturado. Isso é
**neocolagênese**, e ela é **progressiva**: o volume da primeira semana é o
diluente e vai embora; colágeno de verdade começa a aparecer por volta de 30 dias e
tem pico entre 3 e 6 meses. Por isso o protocolo é em sessões espaçadas.

> ⚠️ **Enquadramento sempre no corte de tecido, nunca no glúteo inteiro.** O
> `no full body` no negative prompt é a trava de compliance dentro do próprio
> prompt — Meta estrangula criativo com foco em parte do corpo.

---

**B1 — O corte anatômico do glúteo**
`Push In` lento · 4s
```
Anatomical cross-section of gluteal skin and subcutaneous tissue, clearly separated
layers: epidermis, dermis with a sparse thin collagen network, vertical fibrous
septa, rounded subcutaneous fat lobules, muscle fascia at the base, tissue block
view only, [STYLE SUFFIX]
```

**B2 — As microesferas entrando**
`Dolly In` · 4s
```
Tiny smooth microspheres suspended in clear liquid being deposited into the
subcutaneous fat layer of a tissue cross-section, the spheres settling evenly
between fat lobules, semi-transparent tissue, soft teal rim light on each sphere,
[STYLE SUFFIX]
```

**B3 — O fibroblasto acordando** ← *o take que explica tudo*
`Macro` + `Slow Motion` · 5s
```
Microscopic visualization of a star-shaped fibroblast cell activating, slowly
extending its branching arms outward, surrounded by smooth microspheres, soft
translucent cellular membranes around it, a teal bioluminescent glow spreading
from the cell body, [STYLE SUFFIX]
```

**B4 — Colágeno III virando colágeno I (a maturação)**
`Slow Motion` · 5s
```
Microscopic timelapse of thin disorganized collagen fibers gradually thickening,
aligning and weaving themselves into a dense organized mesh, the network tightening
and structuring itself over time, fibers glowing softly, [STYLE SUFFIX]
```

**B5 — Rede frouxa x rede densa**
Split-screen · 4s
```
Split microscopic comparison, left side a sparse loose collagen network with wide
gaps, right side a dense tightly woven collagen mesh, identical scale and lighting
on both sides, scientific comparison framing, [STYLE SUFFIX]
```
> ⚠️ Isso é **ilustração de mecanismo**, não resultado de paciente. Na legenda,
> escreve *"ilustração do mecanismo de ação"*. Nunca deixa parecer antes/depois clínico.

**B6 — Preenchedor x bioestimulador (o take do "o que NÃO faz")**
Split-screen · 5s
```
Split comparison of the same tissue cross-section, left side a translucent gel
bolus instantly expanding the tissue volume, right side microspheres slowly
triggering a collagen mesh that grows denser over time, identical lighting and
scale on both sides, [STYLE SUFFIX]
```
→ Esse take sozinho resolve a objeção que mais derruba venda de bioestimulador.

**B7 — O diluente que some (expectativa alinhada)**
`Push In` muito lento · 4s
```
Tissue cross-section slightly swollen with clear fluid, the fluid gradually
absorbing and the swelling receding while the small microspheres stay in place
between the fat lobules, subtle and slow, [STYLE SUFFIX]
```
→ Fala dela: *"na primeira semana incha e desincha. Isso é água, não é o resultado."*

**B8 — A linha do tempo**
`Dolly In` lateral · 5s
```
Abstract scientific visualization of a collagen mesh growing progressively denser
in distinct stages along a horizontal path, subtle glowing milestone markers at
intervals, slow continuous forward camera drift, [STYLE SUFFIX]
```
→ Na edição: `30 dias · 90 dias · 6 meses` sobre os marcadores.

---

## 5. BLOCO C — Takes de suporte (servem pros dois blocos)

**C1 — Ampola/seringa em bancada limpa** — `360 Orbit` · 3s
```
Single unlabeled medical syringe and a small glass vial resting on a clean matte
clinical surface, soft studio lighting, elegant minimal product framing, [STYLE SUFFIX]
```

**C2 — Mãos com luva preparando** — `Handheld` sutil · 3s
```
Gloved hands carefully preparing a syringe on a sterile clinical tray, close
framing on hands only, no faces, calm precise movement, [STYLE SUFFIX]
```

**C3 — Fundo abstrato de colágeno (base de card/CTA)** — `Slow Motion` · 5s
```
Abstract slowly drifting network of glowing translucent collagen-like fibers,
depth layers, gentle floating motion, generous negative space in the center,
[STYLE SUFFIX]
```

---

## 6. Dois roteiros que usam a biblioteca

### ROTEIRO 1 — "O que o bioestimulador NÃO faz" *(carro-chefe)*

| t | Imagem | Fala dela |
|---|---|---|
| 0-3s | **Ela, take real, close** | "Se te venderam bioestimulador prometendo volume na hora, te venderam errado." |
| 3-6s | **B6** split preenchedor x bioestimulador | "Preenchedor dá volume na hora. Bioestimulador não é preenchedor." |
| 6-9s | **B2** microesferas entrando | "O que eu aplico não preenche. Ele avisa o teu corpo." |
| 9-13s | **B3** fibroblasto acordando | "Ele acorda a célula que produz o teu colágeno." |
| 13-17s | **B4** colágeno organizando | "E o colágeno vem devagar — porque quem faz é você, não o produto." |
| 17-21s | **B7** diluente sumindo | "Por isso na primeira semana incha e desincha. Aquilo é água." |
| 21-26s | **B8** linha do tempo | "Resultado real começa em 30 dias e fecha entre 3 e 6 meses." |
| 26-30s | **Ela, take real** | "Se alguém te prometer resultado imediato, desconfia. Vem na avaliação que eu te explico o que dá pra fazer no teu caso." |
| final | **C3** + card | `Agende sua avaliação` → WhatsApp |

**Por que funciona:** o criativo inteiro é ela *negando* promessa. Isso é o oposto
do nicho, gera retenção por contraste, e chega na consulta com a expectativa já
alinhada — o que aumenta fechamento e derruba arrependimento.

---

### ROTEIRO 2 — "Onde o ácido hialurônico realmente entra"

| t | Imagem | Fala dela |
|---|---|---|
| 0-3s | **Ela, take real** | "Ácido hialurônico não é aplicado 'no rosto'. É aplicado numa camada." |
| 3-6s | **A7** crash zoom pele → derme | "E a tua pele tem camada. Várias." |
| 6-11s | **A1** corte anatômico, rótulos em cascata | "Epiderme, derme, gordura, SMAS, músculo, osso." |
| 11-15s | **A5** superficial x profundo | "Produto na camada errada não corrige — deforma." |
| 15-19s | **A3** depósito no periósteo | "Estrutura pede plano profundo, apoiado no osso." |
| 19-23s | **A4** hidrofilia | "E ele dá volume porque atrai água. Não é 'inchar', é hidratar." |
| 23-27s | **A6** hialuronidase dissolvendo | "E se não gostar? Dá pra dissolver. Poucos procedimentos são reversíveis assim." |
| 27-31s | **Ela, take real** | "Por isso a pergunta certa não é 'quanto custa'. É 'em que plano você vai aplicar'." |
| final | **C3** + card | `Agende sua avaliação` → WhatsApp |

---

## 7. Ordem de produção (o que gerar primeiro)

Não gere os 18 takes. Gere nesta ordem e valide antes de escalar:

1. **B6, B3, B4** — os três que sustentam o Roteiro 1 (o carro-chefe)
2. **B7, B8, B2, B1** — completa o Roteiro 1
3. **A1, A7, A4** — os três de maior impacto visual do rosto
4. **A5, A3, A6** — completa o Roteiro 2
5. **C1, C2, C3** — suporte, gera por último, reutiliza pra sempre

Cada take: gere **3 variações**, escolhe 1, arquiva as outras 2. Take arquivado
vira criativo novo pro Meta daqui a 3 semanas sem gastar crédito de novo.

---

## 8. Checklist antes de publicar

- [ ] Nenhum texto/rótulo gerado pela IA (todo rótulo entra na edição)
- [ ] Nenhum enquadramento de corpo inteiro — só bloco de tecido
- [ ] Nada gráfico: sem sangue, sem ferida, sem agulha perfurando pele realista
- [ ] Nenhuma imagem apresentada como resultado de paciente
- [ ] Split-screen de mecanismo legendado como *"ilustração do mecanismo de ação"*
- [ ] Nenhuma promessa ou garantia na fala e no texto de tela
- [ ] Registro profissional dela visível no card final
- [ ] A fala dela está tecnicamente correta e sustenta o que a imagem mostra

---

## 9. Pendências

- [ ] **P1** — Confirmar o registro dela (CRM / CRBM / CRO) pra estampar nos criativos — *Jennifer*
- [ ] **P1** — Gravar os takes reais dela dos 2 roteiros (mesma roupa/luz, leva única) — *Jennifer*
- [ ] **P2** — Definir praça, ticket e capacidade de agenda pra montar públicos e budget — *Kaian*
- [ ] **P2** — Validar os 3 primeiros takes (B6, B3, B4) antes de gerar o resto — *Kaian*
- [ ] **P3** — Repetir a estrutura pra um terceiro bloco (fios de PDO? skinbooster?) — *Jennifer*
