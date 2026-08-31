# Prompts de geração (IA de imagem e vídeo)

Prompts-base pra gerar peça com a cara da NEXUS. Ajustar o conteúdo, manter a
espinha de estilo.

## Espinha de estilo (colar em todo prompt)

```
minimalist dark-mode composition, deep navy background (#0B1220),
single teal accent (#00BFA5), Inter-like geometric sans typography,
generous negative space, soft directional lighting, premium tech product
aesthetic in the style of Apple and Linear, no clutter, no stock-photo
cheesiness, photorealistic where people appear, 4k
```

## Negativos (sempre)

```
no busy gradients, no purple, no neon glow overload, no cheesy stock
business people, no lens flare, no watermark, no distorted hands,
no illegible fake text
```

> **Texto sempre entra depois, no editor.** IA de imagem erra tipografia — nunca
> deixar a headline ser gerada dentro da imagem.

## Blocos por tipo de peça

**Hero de anúncio com pessoa**
```
[espinha de estilo] + medium shot of a Brazilian clinic owner in her 30s,
natural expression, real skin texture, modern clinic interior blurred
behind, subject on the left third, right third empty for headline
```

**Peça de produto / interface**
```
[espinha de estilo] + floating dashboard UI panels, subtle depth,
dark interface with teal data highlights, isometric-ish perspective,
right side empty for copy
```

**Fundo abstrato pra card**
```
[espinha de estilo] + abstract soft geometric shapes, very low contrast,
almost flat, background plate for text overlay
```

## Regras de uso

- Rosto humano gerado por IA **não entra** em peça que afirma ser depoimento real.
  Prova social é com cliente de verdade e autorização de imagem.
- Peça gerada por IA passa pelo mesmo [`checklist-de-aprovacao.md`](./checklist-de-aprovacao.md).
- Manter o prompt vencedor registrado em [`banco-de-referencias.md`](./banco-de-referencias.md).
